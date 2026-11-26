# Adventskalender 2026

Vom 1. bis 24. Dezember erscheint jeden Tag ein Beitrag je Reihe: Kindersicht,
Geschichte sowie Rechte und Handlungsmöglichkeiten. Freigegebene Texte werden
wortgetreu übernommen. Neue Texte werden hier nicht automatisch erzeugt.

## Veröffentlichung

Die vollständige, freigegebene JSON-Textquelle wird privat aufbewahrt. Sie darf
nicht in dieses öffentliche Repository, in öffentliche Logs oder in den
Webseiten-Ordner kopiert werden. Nach dem Abruf in eine temporäre Datei:

```sh
python3 redaktion/advent/publish.py --content /privater/pfad/texte.json
```

Das Skript ermittelt den aktuellen Tag in Europe/Berlin. Es schreibt nur fällige
Beiträge, die Kalenderübersicht, die Liste veröffentlichter Beiträge und deren
Sitemap. Vor dem 1. Dezember entsteht nur die geschlossene Kalenderübersicht.
Mehrfache Aufrufe am selben Tag sind unverändert wiederholbar; bei einem
versäumten Lauf werden auch die inzwischen fälligen Tage veröffentlicht.

Ein geplanter täglicher Auftrag ruft dieses Skript auf dem aktuellen main-Stand
auf und veröffentlicht die geänderten Dateien ohne Force-Push. Anschließend
werden die veröffentlichten URLs geprüft. Unveröffentlichte Texte dürfen weder
vorab als HTML noch als JSON oder in Testdateien eingecheckt werden.

## Bilder

Die ersten drei Bilder sind Entwürfe und noch nicht zur Veröffentlichung
freigegeben. Nur ausdrücklich freigegebene Motive werden unter
`img/advent2026/` abgelegt und in `approved-images.json` zugeordnet, zum Beispiel:

```json
{
  "tag-01-kindersicht": {
    "approved": true,
    "src": "/img/advent2026/tag-01-kindersicht.webp",
    "alt": "Beschreibung des freigegebenen Motivs"
  }
}
```

Ohne freigegebenes Motiv bleibt der Beitrag ein Textbeitrag. Das Skript nennt
fehlende Motive in seiner Ausgabe. Es setzt keine Ersatzbilder und erzeugt
keine neuen Bilder. Nach einer Freigabe ergänzt ein erneuter Lauf Bilder auch
in bereits erschienenen Beiträgen. Historische Illustrationen und szenische
Darstellungen werden als solche gekennzeichnet; keine privaten Akten verwenden.

## Prüfung

`python3 -m unittest discover -s redaktion/advent -p 'test_*.py'` prüft die
Freigabegrenzen und Wiederholbarkeit mit erfundenen Testtexten. Die echten
freigegebenen Texte sind kein Bestandteil der Tests und dieses Repositories.
