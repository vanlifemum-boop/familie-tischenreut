"""Check the published parents' rights catalogue without third-party packages."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.scripts, self.stack, self.errors = [], [], [], [], []
        self.h1 = 0
        self.body_depth = None
        self.words = []
        self.json_active = False
        self.json_text = ''
        self.canonical = None
        self.feed(source)
        if self.stack:
            self.errors.append('unclosed: ' + ','.join(self.stack))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if 'id' in a: self.ids.append(a['id'])
        if 'href' in a: self.links.append(a['href'])
        if 'src' in a: self.links.append(a['src'])
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href')
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.json_active, self.json_text = True, ''
        if a.get('class') == 'article-body': self.body_depth = len(self.stack)
        if tag not in VOID: self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack or self.stack[-1] != tag:
            self.errors.append('unexpected closing ' + tag)
        if tag in self.stack:
            while self.stack:
                if self.stack.pop() == tag: break
        if self.body_depth is not None and len(self.stack) <= self.body_depth: self.body_depth = None
        if tag == 'script' and self.json_active:
            try: self.scripts.append(json.loads(self.json_text))
            except ValueError as exc: self.errors.append('invalid JSON-LD: ' + str(exc))
            self.json_active = False
    def handle_data(self, text):
        if self.json_active: self.json_text += text
        if self.body_depth is not None: self.words.extend(re.findall(r'\S+', text))

def check():
    catalogue = json.loads((ROOT/'rechte-fuer-eltern-katalog.json').read_text())
    errors = []
    slugs = [x['slug'] for x in catalogue]
    if len(slugs) != 22 or len(set(slugs)) != 22: errors.append('Expected 22 distinct article paths')
    paths = [f'recht-erklaert/{s}.html' for s in slugs]
    paths += ['rechte-fuer-eltern.html', 'recht-erklaert.html', 'elternrechte-begriffe.html']
    pages = {}
    for p in ROOT.rglob('*.html'):
        if '.git' not in p.parts: pages[p.resolve()] = Page(p.read_text())
    sitemap = {e.text for e in ET.parse(ROOT/'sitemap.xml').iter() if e.tag.endswith('loc')}
    word_counts = {}
    for path in paths:
        p = (ROOT/path).resolve()
        if p not in pages:
            errors.append(path + ': missing'); continue
        page = pages[p]
        errors += [path + ': ' + e for e in page.errors]
        if page.h1 != 1: errors.append(path + ': expected one h1')
        duplicates = [i for i,n in Counter(page.ids).items() if n > 1]
        if duplicates: errors.append(path + ': duplicate IDs ' + str(duplicates))
        expected = 'https://systemfehlerfamilie.de/' + path
        if page.canonical != expected: errors.append(path + ': incorrect canonical')
        if expected not in sitemap: errors.append(path + ': not in sitemap')
        if path.startswith('recht-erklaert/'):
            word_counts[path] = len(page.words)
            if len(page.words) < 800: errors.append(path + ': fewer than 800 words')
            if '26.10.2026' not in p.read_text() and '2026-10-26' not in p.read_text(): errors.append(path + ': missing review date')
        for href in page.links:
            u = urlsplit(href)
            if u.scheme or u.netloc: continue
            target = (ROOT/unquote(u.path).lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path)).resolve() if u.path else p
            if not target.exists():
                errors.append(path + ': missing target ' + href)
            elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:
                errors.append(path + ': missing anchor ' + href)
    hub = (ROOT/'rechte-fuer-eltern.html').read_text()
    for slug in slugs:
        if f'href="recht-erklaert/{slug}.html"' not in hub: errors.append(slug + ': absent from hub')
    for path in ['downloads/akteneinsicht-25-sgb-x-art-15-dsgvo.docx','downloads/ankuendigung-beistand-13-sgb-x.docx','downloads/auskunft-art15-dsgvo-muster.docx','downloads/dienstaufsichtsbeschwerde-muster.docx']:
        import zipfile
        with zipfile.ZipFile(ROOT/path) as z:
            if z.testzip(): errors.append(path + ': corrupt DOCX')
            ET.fromstring(z.read('word/document.xml'))
    print(json.dumps({'checked_pages':len(paths),'article_count':len(slugs),'min_article_words':min(word_counts.values()),'errors':errors},ensure_ascii=False,indent=2))
    return 1 if errors else 0

if __name__ == '__main__': sys.exit(check())
