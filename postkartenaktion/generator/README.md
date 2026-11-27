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
den drei Vorgaben. Die Veröffentlichung der ausführlichen Falltexte und freigegebenen, geschwärzten
Belegbilder wurde am 26.11.2026 erneut ausdrücklich beauftragt.

## Respektvolle Texte

`text-policy.js` prüft Überschrift, Text, Ergänzung und Adresse lokal auf eine
begrenzte Liste von Beleidigungen, diskriminierenden Ausdrücken und eindeutigen
Drohungen. Formular und PDF-Erstellung blockieren Treffer; nach Korrektur kann
die PDF erstellt werden. Die Prüfung ist keine kontextbezogene Moderation und
kann durch Änderungen am clientseitigen Code umgangen werden. Keine Eingaben
werden zur Prüfung an einen Server geschickt. Ein sichtbarer Hinweis erklärt
die Verhaltensregeln und die Grenzen der automatischen Erkennung.

Porto November 2026: Deutsche Post 0,95 Euro Inland, 1,25 Euro Ausland.
Steuerhinweis eingeschränkt auf betriebliche Veranlassung (§ 4 Abs. 4 EStG).
Hilfeplanung: §§ 36, 37c SGB VIII. Kinderrechte: UNICEF-Verweis auf UN-KRK.

## Abhängigkeiten

- pdf-lib 1.17.1 (MIT), LICENSE im vendor-Verzeichnis.
- @pdf-lib/fontkit 1.1.1 (MIT laut mitgelieferter README und Paketmanifest).
- DejaVu Sans, Lizenzinformationen neben der Schriftdatei.

Die Vorschauverzeichnisse previewdist/ und .openai/ gehören nicht zur
GitHub-Pages-Veröffentlichung dieser bestehenden Website.

## Empfänger und Statistik

`address.js` setzt die optionale Zeile „z. Hd.“ unter die erste Empfängerzeile.
Freie Anschriften bleiben bearbeitbar; Vorschau und PDF nutzen dieselbe
Formatierung. Das zusätzliche Feld unterliegt derselben Wortprüfung.
Die Seite bindet `/js/main.js` für die bestehende interne Aufrufstatistik ein.
Die Statistik übermittelt nur Seitenpfad und Seitentitel, keine Formularinhalte;
die vorhandene lokale Widerspruchseinstellung bleibt wirksam.

## Bearbeitbare Vorlagen und Vierer-Druckbögen

Mustertext und Überschrift werden in die Eingabefelder geladen. Änderungen bleiben
pro Auswahl während der geöffneten Sitzung erhalten. Eigener Text startet leer.
Grenzen: 70 Wörter / 550 Zeichen im Text, 80 Zeichen in der Überschrift;
zusätzlich prüft die PDF das Layout mit mindestens 9 pt Textgröße.
Die lokale Beleidigungsprüfung gilt auch für bearbeitete Vorlagen.
Jede generierte Rückseite enthält einen QR-Code zur Aktion.

`scripts/build-postcard-sheets.py` erzeugt drei feste Vierer-PDFs (A4 quer,
140 × 99,32 mm je Karte, direkt aneinander, kleiner Druckrand) und das große
A4-Ausmalbild. Für Duplex an der kurzen Kante sind die Rückseitenspalten
vertauscht. Kartenreihenfolge vorn: Rot, Eisblau, Fenster, Rot.
Texte: 1, 2, 3, 1. PDF-Druckeinstellungen: tatsächliche Größe, kurze Kante;
bei manuellem Wenden Einlegerichtung anhand eines Probeblatts prüfen.
Quellen und Prüfdatum der SOS-Vorstandsadresse stehen im Erzeugungsskript.

## Sprachversionen (27.11.2026)

Die Postkartenaktion ist vollständig auf Deutsch, Polnisch, Ukrainisch, Englisch
und Französisch verfügbar. Statische Sprachpfade: /postkartenaktion/ sowie
/{pl,uk,en,fr}/postkartenaktion/. Deutsche Originalzitate bleiben unverändert;
Übersetzungen stehen getrennt und gekennzeichnet daneben. Bei Änderungen
am deutschen Inhalt sind alle Sprachversionen erneut sinngenau abzugleichen.

`i18n.js` lädt synchron das zum HTML-lang passende Wörterbuch. Die editierbaren
Vorlagen liegen unter `locales/*-texts.json`. `locales/runtime.json` hält die
Zuordnung deutscher Ausgangstexte zu den Laufzeitübersetzungen; `i18n.js` muss
bei deren Änderung entsprechend aktualisiert werden. Alle Bibliotheken, Motive
und Schriften werden von den gemeinsamen absoluten /postkartenaktion/-Pfaden
geladen. Empfängernamen und Postanschriften bleiben in der Originalschreibweise.

Fertige Druckbögen und Bildvorderseiten bleiben deutsche Originale und sind so
gekennzeichnet. Der Generator erstellt Rückseiten in der gewählten Sprache
und unterstützt polnische, ukrainische, englische und französische Schriftzeichen.
Die vorhandene begrenzte Wortprüfung bleibt erhalten; sie ist keine vollständige
mehrsprachige Moderation.

Prüfung: 30 PDFs über fünf Sprachen, alle drei Vorlagen und vier Druckarten;
Seitenzahlen, Textgrenzen und Schriftzeichen kontrolliert, ukrainische und
französische Druckausgaben visuell geprüft.
