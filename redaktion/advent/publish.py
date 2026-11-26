#!/usr/bin/env python3
"""Publish only due, approved Advent copy; seed text stays outside this public repo."""
from datetime import datetime, date
from zoneinfo import ZoneInfo
from pathlib import Path
import argparse, html, json, re

YEAR = 2026
ORIGIN = 'https://systemfehlerfamilie.de'
SERIES = {'kindersicht':'Kindersicht', 'geschichte':'Geschichte', 'rechte':'Rechte und Handlungsmöglichkeiten'}
ESC = html.escape

def shell(title, description, path, main):
    return f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{ESC(title)} | Systemfehler Familie</title><meta name="description" content="{ESC(description, quote=True)}">
<link rel="canonical" href="{ORIGIN}{path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="{ESC(title, quote=True)}"><meta property="og:description" content="{ESC(description, quote=True)}">
<meta property="og:type" content="article"><meta property="og:url" content="{ORIGIN}{path}">
<meta property="og:site_name" content="Systemfehler Familie"><meta name="theme-color" content="#172536">
<link rel="stylesheet" href="/adventskalender/calendar.css"></head><body>
<a class="skip" href="#inhalt">Zum Inhalt</a>
<header class="sitebar"><a class="brand" href="/">System<span>fehler</span> Familie</a><nav aria-label="Hauptnavigation"><a href="/blog.html">Blog</a><a href="/adventskalender/">Adventskalender</a><a href="/postkartenaktion/">Postkartenaktion</a><a href="/kontakt.html">Kontakt</a></nav></header>
<main id="inhalt">{main}</main>
<footer><a href="/">Systemfehler Familie</a><span>Advent 2026</span><a href="/impressum.html">Impressum</a><a href="/datenschutz.html">Datenschutz</a></footer>
<script src="/js/main.js"></script></body></html>'''

def write_if_changed(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding='utf-8') == data:
        return False
    path.write_text(data,encoding='utf-8')
    return True

def validate(seed):
    assert seed['year']==YEAR and seed['timezone']=='Europe/Berlin'
    posts=seed['posts']
    assert len(posts)==72
    assert len({p['id'] for p in posts})==72
    for d in range(1,25):
        assert {p['series'] for p in posts if p['day']==d}==set(SERIES)
    for p in posts:
        assert p['id']==f"tag-{p['day']:02d}-{p['series']}"
        assert len(p['body'])>900 and p['title'].strip()
        for s in p['sources']: assert s['url'].startswith('https://')

def build(root, seed, as_of):
    validate(seed)
    root=Path(root)
    dest=root/'adventskalender'
    image_file=root/'redaktion/advent/approved-images.json'
    images=json.loads(image_file.read_text()) if image_file.exists() else {}
    due=[p for p in seed['posts'] if date(YEAR,12,p['day'])<=as_of]
    released_days=sorted({p['day'] for p in due})
    changes=[]
    missing_images=[]
    for p in due:
        img=images.get(p['id'])
        visual=''
        if img and img.get('approved') is True:
            src=img['src']
            if not re.fullmatch(r'/img/advent2026/[A-Za-z0-9_.-]+\.(?:webp|png|jpe?g)',src):
                raise ValueError(f'Invalid approved image path: {src}')
            if not (root/src.lstrip('/')).is_file():
                raise ValueError(f'Approved image missing: {src}')
            visual=f'<figure><img src="{ESC(src,quote=True)}" alt="{ESC(img["alt"],quote=True)}" width="1080" height="1350"></figure>'
        else:
            missing_images.append(p['id'])
        paragraphs='\n'.join('<p>'+ESC(x)+'</p>' for x in p['body'].split('\n\n'))
        sources=''
        if p['sources']:
            sources='<aside class="sources"><h2>Quellen</h2><ul>'+''.join(f'<li><a href="{ESC(s["url"],quote=True)}" rel="noopener">{ESC(s["label"])}</a></li>' for s in p['sources'])+'</ul></aside>'
        other=''.join(f'<a href="/adventskalender/{q["id"]}.html">{ESC(SERIES[q["series"]])}</a>' for q in due if q['day']==p['day'] and q['id']!=p['id'])
        role=' · Szenischer Text' if p['series']=='kindersicht' else ''
        body=f'''<article class="reading"><a class="back" href="/adventskalender/#tag-{p['day']}">Zum Adventskalender</a>
<p class="eyebrow">{p['day']}. Dezember {YEAR} · {ESC(SERIES[p['series']])}{role}</p>
<h1>{ESC(p['title'])}</h1>{visual}<div class="prose">{paragraphs}</div>{sources}
<nav class="related" aria-label="Weitere Beiträge dieses Tages"><h2>Die anderen Türchen dieses Tages</h2>{other}</nav></article>'''
        path=f'/adventskalender/{p["id"]}.html'
        if write_if_changed(root/path.lstrip('/'),shell(p['title'],p['body'].split('\n\n')[0],path,body)): changes.append(path)
    tiles=[]
    for d in range(1,25):
        if d in released_days:
            tiles.append(f'<a class="door open" href="#tag-{d}" aria-label="{d}. Dezember: drei Beiträge lesen"><strong>{d:02d}</strong><span>Drei Beiträge lesen</span></a>')
        else:
            tiles.append(f'<div class="door closed" aria-label="{d}. Dezember: noch geschlossen"><strong>{d:02d}</strong><span>Ab {d}. Dezember</span></div>')
    days=[]
    for day in reversed(released_days):
        cards=[]
        for p in (p for p in due if p['day']==day):
            cards.append(f'<article class="card {p["series"]}"><p class="eyebrow">{ESC(SERIES[p["series"]])}</p><h3><a href="/adventskalender/{p["id"]}.html">{ESC(p["title"])}</a></h3><p>{ESC(p["body"].split(chr(10)+chr(10))[0])}</p><a class="readmore" href="/adventskalender/{p["id"]}.html">Beitrag lesen</a></article>')
        days.append(f'<section class="day" id="tag-{day}"><h2>{day}. Dezember</h2><div class="cards">'+''.join(cards)+'</div></section>')
    status='Das erste Türchen öffnet sich am 1. Dezember.' if not due else f'{len(released_days)} Tage geöffnet · {len(due)} Beiträge zum Lesen'
    main=f'''<section class="intro"><p class="eyebrow">1. bis 24. Dezember 2026</p><h1>Adventskalender 2026</h1>
<p class="lead">Jeden Tag drei Türchen: Was Kinder fühlen. Was die Geschichte zeigt. Welche Rechte im Alltag zählen.</p>
<div class="perspectives"><span>Kindersicht</span><span>Geschichte</span><span>Rechte</span></div><p class="status">{status}</p></section>
<section class="calendar" aria-label="Die 24 Adventstürchen">{''.join(tiles)}</section>
<div class="days">{''.join(days)}</div>'''
    if write_if_changed(dest/'index.html',shell('Adventskalender 2026','Vom 1. bis 24. Dezember täglich drei Beiträge: Kindersicht, Geschichte und Rechte.','/adventskalender/',main)): changes.append('/adventskalender/index.html')
    manifest={'year':YEAR,'days':released_days,'posts':[{'id':p['id'],'day':p['day'],'series':p['series'],'title':p['title']} for p in due]}
    if write_if_changed(dest/'published.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'): changes.append('/adventskalender/published.json')
    urls=[ORIGIN+'/adventskalender/']+[f'{ORIGIN}/adventskalender/{p["id"]}.html' for p in due]
    sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{ESC(u)}</loc></url>\n' for u in urls)+'</urlset>\n'
    if write_if_changed(dest/'sitemap.xml',sitemap): changes.append('/adventskalender/sitemap.xml')
    return {'as_of':as_of.isoformat(),'released_days':len(released_days),'posts':len(due),'changed_paths':changes,'missing_approved_images':missing_images}

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--content',required=True,help='Approved private JSON source, never commit this file')
    args=parser.parse_args()
    print(json.dumps(build(Path(__file__).resolve().parents[2],json.loads(Path(args.content).read_text(encoding='utf-8')),datetime.now(ZoneInfo('Europe/Berlin')).date()),ensure_ascii=False,indent=2))
