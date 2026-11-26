# Postkarten-Generator

Veröffentlichungsstand vom 26.11.2026. Die Veröffentlichung des Generators
und der Ausmalbild-Downloads wurde von der Nutzerin beauftragt.

## Funktionsumfang

Vier genehmigte Vorderseiten, drei vorgegebene Rückseitentexte, persönliche
Ergänzungen, eine Rückseite nur mit eigenem Text (optionale Überschrift) und 49 Empfänger aus der bereitgestellten PDF. Adressen bleiben
bearbeitbar; ein leeres Feld erzeugt Linien zum späteren Ausfüllen.
PDF-Erstellung erfolgt im Browser mit lokal ausgelieferten Bibliotheken,
Schriftdateien und Motiven. Eingaben werden nicht an einen PDF-Dienst gesendet.

`app.js` steuert Formular, Vorschau und Downloads. `pdf.js` erstellt A6
(148 × 105 mm), A4 zum Zusammenkleben oder zwei deckungsgleiche A4-Seiten
für automatischen oder manuellen Duplexdruck. 100 % Druckgröße verwenden.
Die unteren 15 mm der Anschriftseite bleiben frei. Zu lange Texte und
Adressen sowie nicht unterstützte Schriftzeichen lösen eine Meldung aus.

## Prüfung

- 48 Kombinationen aus vier Motiven, drei Texten und vier Druckarten erzeugt;
  Seitenzahl und Seitenbreite kontrolliert.
- Alle 49 Empfängeradressen erfolgreich gesetzt.
- Textüberlauf, Adressüberlauf und fehlende Schriftzeichen geprüft.
- Alle vier QR-Codes auf https://systemfehlerfamilie.de/postkartenaktion/ geprüft.
- Örtliche Links und Assets geprüft; PDF-Muster gerendert und visuell geprüft.
- Browserablauf mit Adresssuche, eigener Ergänzung und PDF-Download geprüft.
- Kein physischer Drucktest: Druckertoleranzen und Papiereinzug erfordern
  weiterhin den erläuterten Probedruck.

## Quellen und noch offene Inhalte

Adressdatei: Systemfehlerfamilie_Postanschriften_2026-11-26.pdf, unverändert
als downloads/Postanschriften.pdf hinterlegt. Texte in texts.json entsprechen
den drei Vorgaben. Diese Veröffentlichung umfasst den Generator und die Download-Dateien.
Die ausführlichen Falltexte bleiben im getrennten Arbeitsentwurf.

Porto November 2026: Deutsche Post 0,95 Euro Inland, 1,25 Euro Ausland.
Steuerhinweis eingeschränkt auf betriebliche Veranlassung (§ 4 Abs. 4 EStG).
Hilfeplanung: §§ 36, 37c SGB VIII. Kinderrechte: UNICEF-Verweis auf UN-KRK.

## Abhängigkeiten

- pdf-lib 1.17.1 (MIT), LICENSE im vendor-Verzeichnis.
- @pdf-lib/fontkit 1.1.1 (MIT laut mitgelieferter README und Paketmanifest).
- DejaVu Sans, Lizenzinformationen neben der Schriftdatei.

Die Vorschauverzeichnisse previewdist/ und .openai/ gehören nicht zur
GitHub-Pages-Veröffentlichung dieser bestehenden Website.
