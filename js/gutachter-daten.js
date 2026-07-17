// ============================================================
// GUTACHTER-VERZEICHNIS – Ihre Daten
// ============================================================
// Hier tragen Sie echte Gutachter/innen und Anwälte/Anwältinnen ein.
// Einfach diese Datei in einem Texteditor öffnen, einen Block kopieren,
// ausfüllen und speichern. Kein Programmieren nötig.
//
// WICHTIG ZUM KOMMENTAR-FELD (rechtliche Sicherheit):
// Schreiben Sie Ihre eigene Wahrnehmung, keine unbeweisbaren Tatsachen
// über eine namentlich genannte Person. Siehe dazu unseren Leitfaden:
// ../podcast-leitfaden.html (die Regeln gelten hier genauso).
//
//   RISKANT:  "Herr X hat die Akte nie gelesen."
//   SICHERER: "Ich hatte den Eindruck, dass die Akte nicht vollständig
//              berücksichtigt wurde."
//
// Jeder Kommentar sollte möglichst mit "Aus meiner Sicht…", "Ich empfand…"
// oder "Mein Eindruck war…" beginnen. Bei Zweifeln: Formulierung vor der
// Veröffentlichung anwaltlich prüfen lassen.
//
// EXTERNE QUELLEN (fremde Erfahrungsberichte, nicht die eigene Erfahrung):
// Fremde Texte/Kommentare NICHT kopieren (Urheberrecht + Sie würden für
// fremde Tatsachenbehauptungen mithaften). Stattdessen im Feld "quelle"
// nur verlinken – der Leser entscheidet selbst, ob er dort weiterliest.
// ============================================================

var GUTACHTER = [
  // BEISPIEL-EINTRAG – bitte durch echte Einträge ersetzen oder löschen:
  {
    name: "Beispiel: Dr. Muster Mustermann",
    ort: "Musterstadt",
    fachrichtung: "Familienpsychologisches Gutachten",
    adresse: "Musterstraße 1, 00000 Musterstadt",
    kommentare: [
      { text: "Aus meiner Sicht wurde im Gespräch wenig auf die Perspektive des Kindes eingegangen. Das ist mein persönlicher Eindruck aus einem Termin.", von: "Betroffene Mutter, 2026" }
    ]
  },
  {
    name: "Brigitte Dittrich",
    ort: "",
    fachrichtung: "Familienpsychologisches Gutachten (Sorgerecht/Umgang)",
    adresse: "",
    kommentare: [],
    quelle: {
      url: "https://www.vaterlos.eu/brigitte-dittrich/",
      label: "Erfahrungsberichte Betroffener auf vaterlos.eu"
    }
  }
  // Weiteren Eintrag hinzufügen – diesen Block kopieren und ausfüllen:
  // ,{
  //   name: "",
  //   ort: "",
  //   fachrichtung: "",
  //   adresse: "",
  //   kommentare: [
  //     { text: "", von: "" }
  //   ]
  // }
];

var ANWAELTE = [
  // BEISPIEL-EINTRAG – bitte durch echte Empfehlungen ersetzen oder löschen:
  {
    name: "Beispiel: Rechtsanwältin Erika Musterfrau",
    ort: "Musterstadt",
    fachrichtung: "Fachanwältin für Familienrecht",
    kontakt: "kanzlei@beispiel.de · 0000 / 000000",
    kommentare: [
      { text: "Hat sich aus meiner Sicht sehr engagiert für uns eingesetzt und war auch außerhalb der Sprechzeiten erreichbar.", von: "Betroffener Vater, 2026" }
    ]
  }
  // Weiteren Eintrag hinzufügen – diesen Block kopieren und ausfüllen:
  // ,{
  //   name: "",
  //   ort: "",
  //   fachrichtung: "",
  //   kontakt: "",
  //   kommentare: [
  //     { text: "", von: "" }
  //   ]
  // }
];
