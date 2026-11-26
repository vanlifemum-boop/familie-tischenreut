import copy
from datetime import date
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

spec = importlib.util.spec_from_file_location('advent_publish', Path(__file__).with_name('publish.py'))
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.seed = {'year': 2026, 'timezone': 'Europe/Berlin', 'posts': [
            {'id': f'tag-{day:02d}-{series}', 'day': day, 'series': series,
             'title': f'Testtitel-{day:02d}-{series}',
             'body': f'Erster Testabsatz {day}.\n\n' + 'Nur erfundener Testtext. ' * 60,
             'sources': []}
            for day in range(1, 25) for series in publisher.SERIES
        ]}

    def build(self, when):
        return publisher.build(self.root, self.seed, when)

    def test_before_advent_has_no_posts_or_future_titles(self):
        result = self.build(date(2026, 11, 30))
        self.assertEqual(result['posts'], 0)
        self.assertFalse(list(self.root.rglob('tag-*.html')))
        self.assertNotIn('Testtitel', (self.root / 'adventskalender/index.html').read_text())
        self.assertEqual(len(ET.parse(self.root / 'adventskalender/sitemap.xml').getroot()), 1)

    def test_first_day_publishes_exactly_three(self):
        result = self.build(date(2026, 12, 1))
        self.assertEqual(result['posts'], 3)
        self.assertEqual(len(list(self.root.rglob('tag-*.html'))), 3)
        html = (self.root / 'adventskalender/index.html').read_text()
        self.assertIn('Testtitel-01-kindersicht', html)
        self.assertNotIn('Testtitel-02', html)
        self.assertEqual(len(ET.parse(self.root / 'adventskalender/sitemap.xml').getroot()), 4)

    def test_catchup_and_repeat_preserve_published_posts(self):
        self.build(date(2026, 12, 1))
        first = (self.root / 'adventskalender/tag-01-kindersicht.html').read_bytes()
        result = self.build(date(2026, 12, 3))
        self.assertEqual(result['posts'], 9)
        self.assertEqual(first, (self.root / 'adventskalender/tag-01-kindersicht.html').read_bytes())
        self.assertEqual(self.build(date(2026, 12, 3))['changed_paths'], [])

    def test_final_day_has_all_72_without_later_duplicates(self):
        self.assertEqual(self.build(date(2026, 12, 24))['posts'], 72)
        self.assertEqual(len(list(self.root.rglob('tag-*.html'))), 72)
        self.assertEqual(self.build(date(2026, 12, 25))['changed_paths'], [])

    def test_only_approved_images_appear(self):
        image_dir = self.root / 'img/advent2026'
        image_dir.mkdir(parents=True)
        (image_dir / 'test.webp').write_bytes(b'test')
        cfg = self.root / 'redaktion/advent/approved-images.json'
        cfg.parent.mkdir(parents=True)
        item = {'approved': False, 'src': '/img/advent2026/test.webp', 'alt': 'Ein Testbild'}
        cfg.write_text(json.dumps({'tag-01-kindersicht': item}))
        result = self.build(date(2026, 12, 1))
        page = self.root / 'adventskalender/tag-01-kindersicht.html'
        self.assertNotIn('<img', page.read_text())
        self.assertEqual(len(result['missing_approved_images']), 3)
        item['approved'] = True
        cfg.write_text(json.dumps({'tag-01-kindersicht': item}))
        result = self.build(date(2026, 12, 1))
        self.assertIn('/img/advent2026/test.webp', page.read_text())
        self.assertEqual(len(result['missing_approved_images']), 2)

    def test_missing_or_unsafe_approved_image_fails(self):
        cfg = self.root / 'redaktion/advent/approved-images.json'
        cfg.parent.mkdir(parents=True)
        for src in ('/img/advent2026/missing.webp', '/img/advent2026/../../private.png'):
            cfg.write_text(json.dumps({'tag-01-kindersicht': {'approved': True, 'src': src, 'alt': 'Test'}}))
            with self.assertRaises(ValueError):
                self.build(date(2026, 12, 1))

    def test_bad_source_does_not_write_posts(self):
        for key, value in (('year', 2027), ('timezone', 'UTC'), ('posts', self.seed['posts'][:-1])):
            bad = copy.deepcopy(self.seed)
            bad[key] = value
            with self.assertRaises(AssertionError):
                publisher.build(self.root, bad, date(2026, 12, 1))
        self.assertFalse(list(self.root.rglob('*.html')))


if __name__ == '__main__':
    unittest.main()
