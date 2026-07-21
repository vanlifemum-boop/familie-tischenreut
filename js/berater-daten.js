// ============================================================
// BERATER-VERZEICHNIS – Ihre Daten
// ============================================================
// Hier tragen Sie Berater/innen ein, die betroffenen Eltern ein
// Telefongespräch anbieten. Einfach diese Datei in einem Texteditor
// öffnen, einen Block kopieren, ausfüllen und speichern. Kein
// Programmieren nötig.
//
// WICHTIG ZUM RECHTSDIENSTLEISTUNGSGESETZ (RDG):
// Wer keine zugelassene Rechtsanwältin / kein zugelassener Rechtsanwalt
// ist, darf Erfahrungen weitergeben und persönlich unterstützen, aber
// keine konkrete Rechtsberatung im Einzelfall erteilen (z. B. keine
// verbindliche Einschätzung "Sie gewinnen/verlieren vor Gericht").
// Formulieren Sie das Thema/die Erfahrung entsprechend, z. B.:
//
//   RISKANT:  "Rechtsberatung zu Sorgerechtsverfahren"
//   SICHERER: "Erfahrungsaustausch: eigenes Sorgerechtsverfahren,
//              wie ich vorgegangen bin"
//
// WICHTIG ZUM KALENDER-LINK (ZENTRAL, BEZAHLTE TERMINE):
// Die Zahlungen laufen zentral über Sie – nicht über einzelne
// Berater/innen. Dafür EIN Konto bei einem Buchungstool mit
// eingebauter Bezahlfunktion anlegen, z. B.:
//   https://tidycal.com   (empfohlen: einmalige Zahlung, dauerhaft nutzbar,
//                          Stripe-Zahlung beim Buchen eingebaut)
//   https://simplybook.me (Alternative, kostenloser Einstieg möglich)
//   https://calendly.com / https://acuityscheduling.com (Alternative, Abo nötig)
// In diesem EINEN Konto legen Sie pro Berater/in bzw. Thema einen
// eigenen Buchungstyp mit eigenem Preis an. Den jeweiligen
// Unterseiten-Link kopieren und unten bei "kalenderLink" eintragen.
// Ohne kalenderLink zeigt die Karte automatisch den Hinweis
// "Kalender folgt in Kürze" statt eines Buchungs-Buttons.
// Das Tool ist später jederzeit tauschbar – es ist nur ein externer
// Link, keine Code-Integration.
//
// Achtung: Zentrale, bezahlte Terminbuchung wirft vermutlich Fragen zu
// Gewerbeanmeldung, Rechnungspflicht und Steuer auf – das bitte separat
// (z. B. mit Steuerberatung) klären, bevor der erste bezahlte Termin
// live geht.
//
// FELD "preis" (optional): kurzer Text wie "45 € / 30 Min." – wird auf
// der Karte neben dem Thema angezeigt. Ohne Angabe bleibt es leer.
// ============================================================

var BERATER = [
  // BEISPIEL-EINTRAG – bitte durch echte Einträge ersetzen oder löschen:
  {
    name: "Beispiel: Vorname Nachname",
    ort: "Musterstadt",
    thema: "Erfahrungsaustausch: Inobhutnahme & erste Schritte",
    erfahrung: "Eigene Inobhutnahme 2024 durchlebt, seither im Austausch mit anderen betroffenen Eltern. Kein Ersatz für anwaltliche Beratung.",
    preis: "",
    kalenderLink: ""
  }
  // Weiteren Eintrag hinzufügen – diesen Block kopieren und ausfüllen:
  // ,{
  //   name: "",
  //   ort: "",
  //   thema: "",
  //   erfahrung: "",
  //   preis: "45 € / 30 Min.",
  //   kalenderLink: "https://tidycal.com/ihr-konto/thema-x"
  // }
];
