"""Validate both parents' rights catalogues, articles and downloads (stdlib only)."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zipfile
import zlib

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://systemfehlerfamilie.de/'
HOSTS = {'systemfehlerfamilie.de', 'www.systemfehlerfamilie.de'}
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
OLD_DOWNLOADS = [
    'downloads/akteneinsicht-25-sgb-x-art-15-dsgvo.docx',
    'downloads/ankuendigung-beistand-13-sgb-x.docx',
    'downloads/auskunft-art15-dsgvo-muster.docx',
    'downloads/dienstaufsichtsbeschwerde-muster.docx',
]


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.scripts, self.stack, self.errors = [], [], [], [], []
        self.images, self.canonicals, self.cards, self.active_cards = [], [], [], []
        self.h1, self.article_bodies = 0, 0
        self.body_depth, self.words = None, []
        self.json_active, self.json_text = False, ''
        self.source = source
        self.feed(source)
        self.close()
        if self.stack:
            self.errors.append('unclosed: ' + ','.join(self.stack))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if 'id' in a: self.ids.append(a['id'])
        if 'data-recht-card' in a:
            self.cards.append([])
            self.active_cards.append((len(self.stack), self.cards[-1]))
        for key in ('href', 'src'):
            if a.get(key) is not None:
                self.links.append(a[key])
                if key == 'href' and tag == 'a':
                    for _, links in self.active_cards: links.append(a[key])
        if tag == 'img': self.images.append(a)
        if tag == 'link' and 'canonical' in a.get('rel', '').split():
            self.canonicals.append(a.get('href'))
        if tag == 'script' and a.get('type', '').lower() == 'application/ld+json':
            self.json_active, self.json_text = True, ''
        if 'article-body' in a.get('class', '').split():
            self.article_bodies += 1
            self.body_depth = len(self.stack)
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
        if self.body_depth is not None and len(self.stack) <= self.body_depth:
            self.body_depth = None
        self.active_cards = [(d, links) for d, links in self.active_cards if len(self.stack) > d]
        if tag == 'script' and self.json_active:
            try: self.scripts.append(json.loads(self.json_text))
            except ValueError as exc: self.errors.append('invalid JSON-LD: ' + str(exc))
            self.json_active = False

    def handle_data(self, text):
        if self.json_active: self.json_text += text
        if self.body_depth is not None and not any(t in self.stack for t in ('script', 'style')):
            self.words.extend(re.findall(r'\S+', text))


def local_target(root, page_path, href):
    """Resolve local and same-origin URLs; None means an external destination."""
    u = urlsplit(href)
    if u.netloc:
        if u.hostname not in HOSTS or u.scheme not in ('', 'http', 'https'): return None
        path = root / unquote(u.path).lstrip('/')
    elif u.scheme:
        return None
    elif not u.path:
        path = page_path
    else:
        path = (root / unquote(u.path).lstrip('/') if u.path.startswith('/')
                else page_path.parent / unquote(u.path))
    path = path.resolve()
    if not path.is_relative_to(root.resolve()): raise ValueError('target escapes site root')
    if path.is_dir(): path = path / 'index.html'
    return path, unquote(u.fragment)


def schema_nodes(value):
    if isinstance(value, list):
        for item in value: yield from schema_nodes(item)
    elif isinstance(value, dict):
        yield value
        yield from schema_nodes(value.get('@graph', []))


def validate_docx(path):
    with zipfile.ZipFile(path) as archive:
        bad = archive.testzip()
        if bad: raise ValueError('corrupt ZIP member: ' + bad)
        names = archive.namelist()
        if len(names) != len(set(names)): raise ValueError('duplicate ZIP members')
        for required in ('[Content_Types].xml', '_rels/.rels', 'word/document.xml'):
            if required not in names: raise ValueError('missing DOCX part: ' + required)
        for name in names:
            if name.endswith(('.xml', '.rels')): ET.fromstring(archive.read(name))
        document = ET.fromstring(archive.read('word/document.xml'))
        ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        if document.tag != ns + 'document' or not any((e.text or '').strip() for e in document.iter(ns + 't')):
            raise ValueError('missing Word document text')


def png_dimensions(path):
    """Read intrinsic dimensions; reject truncated or corrupt PNG chunks."""
    data = path.read_bytes()
    if data[:8] != b'\x89PNG\r\n\x1a\n': raise ValueError('invalid PNG signature')
    offset, dimensions, has_pixels = 8, None, False
    while offset + 12 <= len(data):
        size = struct.unpack('>I', data[offset:offset + 4])[0]
        end = offset + 12 + size
        if end > len(data): raise ValueError('truncated PNG chunk')
        kind = data[offset + 4:offset + 8]
        payload = data[offset + 8:offset + 8 + size]
        crc = struct.unpack('>I', data[end - 4:end])[0]
        if zlib.crc32(kind + payload) & 0xffffffff != crc: raise ValueError('invalid PNG checksum')
        if dimensions is None:
            if kind != b'IHDR' or size != 13: raise ValueError('missing PNG IHDR')
            dimensions = struct.unpack('>II', payload[:8])
            if not all(dimensions): raise ValueError('empty PNG dimensions')
        if kind == b'IDAT': has_pixels = has_pixels or bool(size)
        if kind == b'IEND':
            if size or not has_pixels or end != len(data): raise ValueError('invalid PNG ending or missing pixels')
            return dimensions
        offset = end
    raise ValueError('missing PNG IEND')


def check(root=ROOT):
    root = Path(root).resolve()
    errors, pages, word_counts = [], {}, {}

    def error(path, message): errors.append(str(path) + ': ' + message)

    def load_json(path):
        try:
            value = json.loads((root / path).read_text(encoding='utf-8'))
            if not isinstance(value, list): raise ValueError('expected a JSON list')
            return value
        except (OSError, ValueError) as exc:
            error(path, str(exc))
            return []

    def get_page(path):
        path = path.resolve()
        if path not in pages:
            try: pages[path] = Page(path.read_text(encoding='utf-8'))
            except (OSError, UnicodeError) as exc:
                error(path.relative_to(root), str(exc))
                pages[path] = None
        return pages[path]

    def resolve(page_path, href):
        try: return local_target(root, page_path, href)
        except ValueError as exc:
            error(page_path.relative_to(root), f'{href}: {exc}')
            return None

    catalogue = load_json('rechte-fuer-eltern-katalog.json')
    slugs = [item.get('slug') for item in catalogue if isinstance(item, dict)]
    if len(slugs) != 22 or any(not isinstance(s, str) for s in slugs) or len(set(slugs)) != 22:
        error('rechte-fuer-eltern-katalog.json', 'expected 22 distinct article slugs')
    old_paths = [f'recht-erklaert/{s}.html' for s in slugs if isinstance(s, str)]
    manifest = load_json('rechte-fuer-eltern/manifest.json')
    entries = [item for item in manifest if isinstance(item, dict)]
    numbers = [item.get('nr') for item in entries]
    if len(manifest) != 70 or len(entries) != 70 or any(type(n) is not int for n in numbers) or sorted(numbers) != list(range(1, 71)):
        error('rechte-fuer-eltern/manifest.json', 'expected each integer nr 1..70 exactly once')
    suffixes = {'path': '.html', 'markdown': '.md', 'docx': '.docx', 'image': '.png', 'svg': '.svg'}
    for field in suffixes:
        values = [item.get(field) for item in entries]
        if any(not isinstance(v, str) or not v for v in values): error('manifest', 'missing or invalid ' + field + ' path')
        elif len(set(values)) != len(values): error('manifest', 'duplicate ' + field + ' paths')
    new_paths = [m['path'] for m in entries if isinstance(m.get('path'), str)]
    article_paths = old_paths + new_paths
    paths = article_paths + ['rechte-fuer-eltern.html', 'recht-erklaert.html', 'elternrechte-begriffe.html']
    try:
        sitemap = Counter((e.text or '').strip() for e in ET.parse(root / 'sitemap.xml').iter()
                          if e.tag.rsplit('}', 1)[-1] == 'loc')
    except (OSError, ET.ParseError) as exc:
        error('sitemap.xml', str(exc))
        sitemap = Counter()
    for path in paths:
        resolved = resolve(root / 'index.html', '/' + path)
        if resolved is None: continue
        p = resolved[0]
        page = get_page(p)
        if page is None: continue
        for problem in page.errors: error(path, problem)
        if page.h1 != 1: error(path, 'expected one h1')
        duplicates = [i for i, n in Counter(page.ids).items() if n > 1]
        if duplicates: error(path, 'duplicate IDs ' + str(duplicates))
        expected = BASE + path
        if page.canonicals != [expected]: error(path, 'expected one correct canonical')
        if sitemap[expected] != 1: error(path, 'expected one sitemap entry')
        nodes = [node for script in page.scripts for node in schema_nodes(script)]
        if not nodes or not any(node.get('@context') for node in nodes):
            error(path, 'missing structured JSON-LD with @context')
        if path in article_paths:
            word_counts[path] = len(page.words)
            if page.article_bodies != 1 or len(page.words) < 800:
                error(path, 'expected one article-body with at least 800 words')
            if '26.10.2026' not in page.source and '2026-10-26' not in page.source: error(path, 'missing review date')
            article_nodes = [node for node in nodes if {'Article', 'BlogPosting'} & set(
                node.get('@type', []) if isinstance(node.get('@type'), list) else [node.get('@type')])]
            if not any(node.get('url') == expected and node.get('headline') for node in article_nodes):
                error(path, 'missing Article/BlogPosting JSON-LD with headline and canonical URL')
        for href in page.links:
            target = resolve(p, href)
            if target is None: continue
            destination, fragment = target
            if not destination.is_file(): error(path, 'missing target ' + href)
            elif fragment and destination.suffix.lower() in ('.html', '.htm'):
                target_page = get_page(destination)
                if target_page is not None and fragment not in target_page.ids: error(path, 'missing anchor ' + href)

    for hub_path, expected_paths, count in [('recht-erklaert.html', old_paths, 22), ('rechte-fuer-eltern.html', new_paths, 70)]:
        hub = get_page(root / hub_path)
        if hub is None: continue
        if len(hub.cards) != count: error(hub_path, f'expected {count} data-recht-card elements')
        expected_targets = {(root / path).resolve() for path in expected_paths}
        card_targets = []
        for index, links in enumerate(hub.cards, 1):
            targets = [t[0] for href in links if (t := resolve(root / hub_path, href)) and t[0] in expected_targets]
            if len(targets) != 1: error(hub_path, f'card {index} must link to exactly one catalogue article')
            card_targets.extend(targets)
        for target in expected_targets:
            if card_targets.count(target) != 1:
                error(hub_path, 'article must appear in exactly one card: ' + str(target.relative_to(root)))

    checked_docx, checked_images = 0, 0
    for m in entries:
        label = f'manifest nr {m.get("nr")}'
        assets = {}
        for field, suffix in suffixes.items():
            value = m.get(field)
            if not isinstance(value, str) or not value: continue
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc or parsed.query or parsed.fragment or value.startswith('/'):
                error(label, field + ' must be a relative site file path')
                continue
            target = resolve(root / 'index.html', value)
            if target is None: continue
            file = target[0]
            if file.suffix.lower() != suffix or not file.is_file():
                error(label, 'missing or wrong file type: ' + value)
                continue
            assets[field] = file
        if 'markdown' in assets:
            try:
                md = assets['markdown'].read_text(encoding='utf-8')
                if len(re.findall(r'\S+', md)) < 800: error(label, 'Markdown contains fewer than 800 words')
            except (OSError, UnicodeError) as exc: error(label, str(exc))
        if 'docx' in assets:
            try:
                validate_docx(assets['docx'])
                checked_docx += 1
            except (OSError, ValueError, zipfile.BadZipFile, ET.ParseError, RuntimeError) as exc:
                error(label, 'invalid DOCX: ' + str(exc))
        dimensions = None
        if 'image' in assets:
            try:
                dimensions = png_dimensions(assets['image'])
                checked_images += 1
                if type(m.get('image_height')) is not int or m['image_height'] <= 0 or dimensions[1] != m['image_height']:
                    error(label, 'PNG height differs from manifest image_height')
            except (OSError, ValueError, struct.error) as exc: error(label, 'invalid PNG: ' + str(exc))
        if 'svg' in assets:
            try:
                svg = ET.parse(assets['svg']).getroot()
                if svg.tag != '{http://www.w3.org/2000/svg}svg': raise ValueError('not an SVG document')
                size = tuple(float(svg.get(key, '').removesuffix('px')) for key in ('width', 'height'))
                viewbox = tuple(float(v) for v in svg.get('viewBox', '').replace(',', ' ').split())
                if dimensions and (size != dimensions or viewbox != (0, 0, *dimensions)):
                    error(label, 'SVG dimensions/viewBox differ from PNG')
            except (OSError, ValueError, ET.ParseError) as exc: error(label, 'invalid SVG: ' + str(exc))
        if 'path' in assets:
            page = get_page(assets['path'])
            if page is None: continue
            targets = {t[0] for href in page.links if (t := resolve(assets['path'], href))}
            for field in ('docx', 'image', 'svg'):
                if field in assets and assets[field] not in targets: error(label, 'article does not link to its ' + field)
            if 'image' in assets:
                images = [img for img in page.images if (t := resolve(assets['path'], img.get('src', ''))) and t[0] == assets['image']]
                if len(images) != 1 or not images[0].get('alt', '').strip():
                    error(label, 'expected one article diagram with alternative text')
                elif dimensions and (images[0].get('width'), images[0].get('height')) != tuple(map(str, dimensions)):
                    error(label, 'HTML image dimensions differ from PNG')
    for path in OLD_DOWNLOADS:
        try:
            validate_docx(root / path)
            checked_docx += 1
        except (OSError, ValueError, zipfile.BadZipFile, ET.ParseError, RuntimeError) as exc: error(path, 'invalid DOCX: ' + str(exc))
    print(json.dumps({'checked_pages': len(paths), 'article_count': len(article_paths),
                      'existing_articles': len(old_paths), 'package_articles': len(new_paths),
                      'min_article_words': min(word_counts.values(), default=None),
                      'checked_docx': checked_docx, 'checked_png': checked_images,
                      'errors': errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == '__main__': sys.exit(check())
