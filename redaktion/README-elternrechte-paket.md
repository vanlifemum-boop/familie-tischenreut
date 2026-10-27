# Redaktion der Elternrechte-Reihe

Die nummerierte Reihe enthält alle 70 Themen des bereitgestellten Archivs `Paragraphen_erklaert_Gesamtpaket_2026.zip`. `rechte-fuer-eltern/manifest.json` ordnet die ursprünglichen Artikel, Vorlagen und Schaubilder den überarbeiteten Webdateien zu. Das Originalarchiv wurde nicht verändert; alle 217 darin verzeichneten SHA256-Prüfsummen wurden bestätigt.

## Inhalte und Prüfgrenzen

- `content/elternrechte-paket/`: redaktionell überarbeitete Markdowntexte mit Primärquellen, Voraussetzungen, Grenzen und konkreten Handlungsschritten.
- `downloads/elternrechte/`: 70 individuell angepasste Word-Vorlagen. Eine Beratungsanfrage ist ausdrücklich kein fristwahrender gerichtlicher Antrag.
- `img/elternrechte/`: 70 neue Schaubilder jeweils als SVG und PNG. Die ursprünglichen generischen Grafiken werden nicht verwendet.
- `redaktion/paket70-rechtspruefung.json`: Herkunft, Quellen, Änderungshinweise, Diagrammdaten und Dokumentprüfung.
- `redaktion/paket70-diagrammlayout.json`: berechnete Bild- und Textbox-Abmessungen.
- `redaktion/paket70-qualitaet.json`: technische und visuelle Abschlusskontrolle.

Die 22 ergänzenden Vertiefungen unter `recht-erklaert/` bleiben separat erreichbar; ihre frühere Bestands- und Änderungsprüfung steht in `rechte-fuer-eltern-pruefung-2026-10-26.json`. Weitere verlinkte Blogartikel und Urteile werden nicht pauschal als vollständig geprüft bestätigt. Die Texte sind allgemeine rechtliche Information; die redaktionelle Quellenprüfung ist kein anwaltliches Gutachten.

Die Überarbeitung wurde im separaten Prüfbranch vorbereitet. Der Upload einschließlich aller Word-Dateien, die Übernahme in `main` und die Live-Veröffentlichung wurden am 27.10.2026 ausdrücklich freigegeben. Der tatsächliche Veröffentlichungsstand ist im [Pull Request 1](https://github.com/vanlifemum-boop/familie-tischenreut/pull/1) und den zugehörigen GitHub-Pages-Läufen nachvollziehbar.

## Wiederholbarer Seitenaufbau

Benötigt werden Python3 mit Pillow, Pandoc sowie Node.js mit sharp. Nach redaktionellen Änderungen an Texten oder Diagrammdaten:

```sh
python scripts/render_paragraph_diagrams.py
node scripts/render_paragraph_png.cjs
python scripts/build_paragraph_package.py
python scripts/validate_parent_rights.py
node --check js/elternrechte.js
git diff --check
```

Der erste Schritt aktualisiert auch die Bildhöhen im Manifest. Vorlagenänderungen müssen erneut gerendert und visuell kontrolliert werden. Die Seitenprüfung kontrolliert unter anderem Vollständigkeit, Wortzahlen, Quellenmetadaten, interne Links und Anker, Canonicals, Sitemap und die Integrität sämtlicher Downloads. Das ersetzt keine visuelle Browserprüfung der Website. Die verwaltete Vorschau war in dieser Arbeitsumgebung nicht verfügbar; dieser Prüfschritt bleibt offen.
