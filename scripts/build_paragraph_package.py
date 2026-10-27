"""Build the 70 numbered legal articles from reviewed Markdown and assets.
Requires pandoc; reviewed content/manifest and sources are retained in the repository.
"""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
import json,re,subprocess,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://systemfehlerfamilie.de/'
CATEGORIES={'01_Grundrechte_Konventionen':'Grundrechte & Konventionen','02_SGB_VIII':'Jugendhilfe','03_KKG_BGB':'Sorge & Umgang','04_FamFG':'Familiengericht','05_Verwaltungsverfahren_Datenschutz':'Verfahren & Datenschutz','06_Rechtsschutz_Gewaltschutz':'Rechtsschutz & Gewaltschutz'}
RELATED={1:['art-6-abs-1-gg-schutz-der-familie','art-6-abs-2-gg-elternrecht','art-6-abs-3-gg-trennung-von-der-familie'],2:['art-1-gg-menschenwuerde','art-2-gg-persoenlichkeitsrecht'],3:['art-19-abs-4-gg-rechtsweggarantie','art-20-abs-3-gg-bindung-an-gesetz-und-recht','art-103-gg-rechtliches-gehoer'],5:['art-8-emrk-familienleben'],7:['un-kinderrechtskonvention-beteiligung-familie'],8:['un-kinderrechtskonvention-beteiligung-familie'],13:['istanbul-konvention-gewaltschutz-umgang'],18:['paragraf-1-sgb-viii-hilfe-vor-kontrolle'],19:['paragraf-5-sgb-viii-wunsch-und-wahlrecht'],20:['paragraf-8-sgb-viii-beteiligung-des-kindes'],21:['paragraf-8a-sgb-viii-schutzauftrag'],22:['paragraf-8b-sgb-viii-insoweit-erfahrene-fachkraft'],23:['paragraf-9a-sgb-viii-ombudsstellen'],25:['paragraf-18-sgb-viii-unterstuetzung-beim-umgang'],33:['paragraf-36-sgb-viii-hilfeplan'],38:['paragraf-42-sgb-viii-inobhutnahme'],61:['paragraf-13-sgb-x-beistand'],62:['paragraf-25-sgb-x-akteneinsicht']}
class Text(HTMLParser):
 def __init__(self,s):super().__init__();self.parts=[];self.feed(s)
 def handle_data(self,d):self.parts.append(d)
 def value(self):return ' '.join(self.parts)
def relative_shell(s):
 return re.sub(r'(href|src)="(?!https?:|#|mailto:|tel:|\.\./|/)([^"]+)"',r'\1="../\2"',s)
def sources(md):return sorted(set(re.findall(r'https?://[^\s)<>]+',md)))
def keywords(m,d,md=''):
 # Match individually cited provisions even when the heading groups several.
 norm=m['norm'];numbers=set(re.findall(r'\d+[a-z]?',norm))
 for a,sa,b,sb in re.findall(r'(\d+)([a-z]?) bis (\d+)([a-z]?)',norm):
  if 0<=int(b)-int(a)<100:numbers.update(str(n) for n in range(int(a),int(b)+1))
  if a==b and sb:numbers.update(a+chr(c) for c in range(ord(sa or 'a'),ord(sb)+1))
 numbers.update(re.findall(r'§+\s*(\d+[a-z]?)',md))
 aliases=' '.join('§'+n for n in sorted(numbers)) if '§' in norm else ''
 situations={21:'Hausbesuch Gefährdungsmeldung',22:'insoweit erfahrene Fachkraft IseF',33:'Hilfeplanprotokoll Unterschrift',38:'Herausnahme Rückführung Widerspruch',49:'Fixierung geschlossene Unterbringung',59:'Kindesanhörung Gutachten Befangenheit',61:'Begleitung Termin Vertrauensperson',62:'Akte Akteneinsicht Kopie',66:'Datenauskunft Löschung',70:'häusliche Gewalt Stalking Schutz Wohnung'}
 return ' '.join([m['slug'],aliases,situations.get(m['nr'],''),*d['steps'],d['limit']])
def main():
 manifest=json.loads((ROOT/'rechte-fuer-eltern/manifest.json').read_text())
 review=json.loads((ROOT/'redaktion/paket70-rechtspruefung.json').read_text())
 rows={r['nr']:r for r in review['articles']};assert set(rows)==set(range(1,71))
 hub=(ROOT/'rechte-fuer-eltern.html').read_text();header=relative_shell(re.search(r'<header.*?</header>',hub,re.S).group()).replace('aria-current="page"','aria-current="location"');footer=relative_shell(re.search(r'<footer.*?</footer>',hub,re.S).group())
 old=json.loads((ROOT/'rechte-fuer-eltern-katalog.json').read_text());old_by_slug={x['slug']:x for x in old}
 cards=[];counts={};cms=[]
 for m in manifest:
  n=m['nr'];r=rows[n];md=(ROOT/m['markdown']).read_text();match=re.match(r'^#\s+(.+)',md);assert match,m['markdown'];title=match.group(1).strip();m['page_title']=title
  md=re.sub(r'^#\s+[^\n]+\n','',md,count=1)
  md=re.sub(r'\n## Downloads zu diesem Artikel\b.*','',md,flags=re.S)
  body=subprocess.run(['pandoc','--from=gfm','--to=html5','--wrap=none'],input=md,text=True,capture_output=True,check=True).stdout
  assert '<script' not in body and '<iframe' not in body,'Unexpected active content'
  words=len(Text(body).value().split());assert words>=800,(n,words);m['wortzahl_geprueft']=words;counts[n]=words
  cat=CATEGORIES[m['kategorie']];d=r['diagram'];m['situation']=d['situation'];m['reviewed_on']=r['reviewed_on'];description=d['situation']+' '+d['limit'];url=BASE+m['path']
  schema={'@context':'https://schema.org','@type':'Article','headline':title,'description':description,'inLanguage':'de-DE','url':url,'mainEntityOfPage':url,'dateModified':'2026-10-26','author':{'@type':'Organization','name':'Systemfehler Familie'},'publisher':{'@type':'Organization','name':'Systemfehler Familie'},'image':BASE+m['image'],'isPartOf':{'@type':'CollectionPage','url':BASE+'rechte-fuer-eltern.html','name':'Rechte für Eltern'}}
  crumbs={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Start','item':BASE},{'@type':'ListItem','position':2,'name':'Rechte für Eltern','item':BASE+'rechte-fuer-eltern.html'},{'@type':'ListItem','position':3,'name':title,'item':url}]}
  figure=f'<figure class="er-article-figure"><img src="../{m["image"]}" alt="Schaubild zu {escape(m["norm"],quote=True)}: {escape(d["situation"],quote=True)}" width="1200" height="{m["image_height"]}" loading="lazy"><figcaption>Vereinfachte Orientierung – die Voraussetzungen und Grenzen stehen im Artikel.</figcaption></figure><details class="er-diagram-text"><summary>Schaubild als Text lesen</summary><p>{escape(d["situation"])}</p><ol>'+''.join(f'<li>{escape(s)}</li>' for s in d['steps'])+f'</ol><p><strong>Grenze:</strong> {escape(d["limit"])}</p></details>'
  download=f'<section class="er-article-downloads" aria-label="Downloads"><h2>Vorlage und Schaubild</h2><p><a href="../{m["docx"]}" download>Bearbeitbare Vorlage (Word)</a> · <a href="../{m["image"]}" download>Schaubild (PNG)</a> · <a href="../{m["svg"]}" download>Schaubild (SVG)</a></p><p class="er-small">Die Hinweise in der Vorlage gehören zum Text. Eine Anfrage ersetzt keinen erforderlichen Antrag oder fristgebundenen Rechtsbehelf. Platzhalter und Adressat vor Verwendung prüfen.</p></section>'
  related=''
  if RELATED.get(n):
   links=[]
   for s in RELATED[n]:links.append(f'<li><a href="../recht-erklaert/{s}.html">{escape(old_by_slug[s]["title"])}</a></li>')
   related='<section class="er-related"><h2>Passende Vertiefungen</h2><ul>'+''.join(links)+'</ul></section>'
  prev=manifest[n-2] if n>1 else None;next_=manifest[n] if n<70 else None
  pager='<nav class="er-article-pager" aria-label="Artikelreihe">'+(f'<a href="../{prev["path"]}">← Thema {n-1:02d}</a>' if prev else '<span></span>')+f'<a href="../rechte-fuer-eltern.html#erklaerungen">Alle 70 Themen</a>'+(f'<a href="../{next_["path"]}">Thema {n+1:02d} →</a>' if next_ else '<span></span>')+'</nav>'
  article=f'''<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} – Systemfehler Familie</title><meta name="description" content="{escape(description,quote=True)}"><link rel="canonical" href="{url}"><link rel="stylesheet" href="../css/style.css"><link rel="stylesheet" href="../css/elternrechte.css"><link rel="icon" href="../favicon.svg" type="image/svg+xml"><meta name="author" content="Systemfehler Familie"><meta property="og:type" content="article"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE+m['image']}"><meta property="og:locale" content="de_DE"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script><script type="application/ld+json">{json.dumps(crumbs,ensure_ascii=False)}</script></head><body><a class="er-skip" href="#inhalt">Zum Inhalt</a>{header}<main id="inhalt"><article class="section"><div class="container article"><p class="crumb"><a href="../rechte-fuer-eltern.html">← Rechte für Eltern</a></p><span class="kat">Thema {n:02d} von 70 · {escape(cat)}</span><h1>{escape(title)}</h1><p class="lead">{escape(d['situation'])}</p><p class="er-small">Erstellt von systemfehlerfamilie.de · Redaktionell geprüft am 26.10.2026</p>{download}<div class="article-body">{body}</div>{figure}{related}{pager}<div class="note">Allgemeine Information. Für die konkrete Anwendung sind Sachverhalt, aktuelle Rechtslage, Zuständigkeit und Fristen zu prüfen.</div></div></article></main>{footer}<script src="../js/main.js"></script></body></html>'''
  (ROOT/m['path']).write_text(article)
  cards.append(f'<article class="er-card" data-recht-card data-category="{escape(cat,quote=True)}" data-keywords="{escape(keywords(m,d,md),quote=True)}"><span class="er-tag">{n:02d} · {escape(cat)}</span><h3><a href="{m["path"]}">{escape(m["norm"])}: {escape(m["titel"])}</a></h3><p>{escape(d["situation"])}</p><p class="er-card-download"><a href="{m["docx"]}" download>Word-Vorlage</a> · <a href="{m["image"]}" download>Schaubild</a></p></article>')
  cms.append((ROOT/m['markdown']).read_text())
 options='<option value="">Alle Themen</option>'+''.join(f'<option>{escape(v)}</option>' for v in CATEGORIES.values())
 block='''<section class="er-block" id="erklaerungen"><h2>Alle 70 Themen der Reihe „§§ erklärt“</h2><p class="er-sub">Jedes Thema hat eine eigene Seite mit Erklärung, konkreten Handlungsschritten, Quellen, Word-Vorlage und Schaubild. Die Nummern entsprechen dem Gesamtpaket.</p><form class="er-filter" id="recht-filter" hidden onsubmit="return false"><div class="er-field"><label for="recht-suche">Situation, Begriff oder Paragraph suchen</label><input id="recht-suche" type="search" placeholder="Zum Beispiel: Hausbesuch, § 25, Gewalt" autocomplete="off"></div><div class="er-field"><label for="recht-bereich">Themenbereich</label><select id="recht-bereich">'''+options+'''</select></div><button id="recht-zuruecksetzen" type="button">Zurücksetzen</button></form><p id="recht-anzahl" class="er-count" aria-live="polite">70 Themen</p><div class="er-catalog">'''+''.join(cards)+'''</div><p id="recht-leer" hidden>Kein Treffer. Versuche einen kürzeren Suchbegriff oder wähle „Alle Themen“.</p><p class="er-small"><a href="recht-erklaert.html">Zu den 22 ergänzenden Vertiefungen →</a></p></section>'''
 hub=re.sub(r'<section class="er-block" id="erklaerungen">.*?</section>',lambda m:block,hub,count=1,flags=re.S)
 hub=hub.replace('Vorlagen für Akteneinsicht, Datenauskunft, Beistand und Dienstaufsichtsbeschwerde.','70 thematisch zugeordnete Word-Vorlagen sowie weitere vorhandene Muster.')
 (ROOT/'rechte-fuer-eltern.html').write_text(hub)
 manifest_path=ROOT/'rechte-fuer-eltern/manifest.json';manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 # Preserve the old 22 URLs and direct readers to the complete numbered catalogue.
 p=ROOT/'recht-erklaert.html';s=p.read_text().replace('Alle 22 Erklärungen der Reihe, einzeln abrufbar. Der zentrale Elternbereich bündelt außerdem Muster, Beratung und weitere Rechtshilfen.','22 ergänzende Vertiefungen zu einzelnen Rechten. Der zentrale Elternbereich enthält die vollständige Reihe mit 70 Themen, Vorlagen und Schaubildern.');p.write_text(s)
 p=ROOT/'downloads.html';s=p.read_text();notice='<aside class="container er-package-download-note" style="padding-top:24px"><div class="note"><strong>70 Vorlagen der Reihe „§§ erklärt“:</strong> <a href="rechte-fuer-eltern.html#erklaerungen">Zum vollständigen Themenverzeichnis mit jeweils zugeordnetem Word-Muster und Schaubild →</a></div></aside>'
 if 'er-package-download-note' not in s:s=s.replace('<main>','<main>\n'+notice,1)
 p.write_text(s)
 # Add all seventy canonical URLs without deleting earlier entries.
 p=ROOT/'sitemap.xml';tree=ET.parse(p);ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns);base=tree.getroot();known={x.find('{'+ns+'}loc').text:x for x in base}
 for m in manifest:
  url=BASE+m['path'];el=known.get(url)
  if el is None:el=ET.SubElement(base,'{'+ns+'}url');ET.SubElement(el,'{'+ns+'}loc').text=url
  last=el.find('{'+ns+'}lastmod')
  if last is None:last=ET.SubElement(el,'{'+ns+'}lastmod')
  last.text='2026-10-26'
 ET.indent(tree,space='  ');tree.write(p,encoding='utf-8',xml_declaration=True)
 print(json.dumps({'built_articles':len(manifest),'min_words':min(counts.values()),'max_words':max(counts.values())}))
if __name__=='__main__':main()
