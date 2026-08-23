/* ============================================================
   Bewertungsformular (Gutachter-Suche)
   ------------------------------------------------------------
   Die Seite liegt auf GitHub Pages und hat keinen eigenen Server.
   Das Formular verschickt deshalb nichts selbst, sondern baut aus
   den Eingaben eine fertige E-Mail und öffnet das E-Mail-Programm
   der Besucherin. So funktioniert die Bewertung ohne jeden Dienst
   und ohne Zugangsschlüssel.

   EMPFAENGER-ADRESSE ÄNDERN: unten die Konstante EMPFAENGER
   anpassen – und zusätzlich die beiden mailto-Links im
   Hinweiskasten in gutachter-suche.html.
   ============================================================ */
(function () {
  var EMPFAENGER = 'systemfehlerfamilie@gmail.com';

  var FRAGEN = [
    ['st-transparenz',    '1. Arbeitsweise transparent erklärt'],
    ['st-datenschutz',    '2. Information über Datenverarbeitung'],
    ['st-welchedaten',    '3. Nachvollziehbar, welche Daten verwendet wurden'],
    ['st-herkunft',       '4. Herkunft der Informationen nachvollziehbar'],
    ['st-sorgfalt',       '5. Sorgfalt mit vertraulichen Informationen'],
    ['st-rechte',         '6. Rechte als betroffene Person berücksichtigt'],
    ['st-dritte',         '7. Grundlage für Auskünfte bei Dritten'],
    ['st-zweck',          '8. Zweck der benötigten Informationen erklärt'],
    ['st-auftrag',        '9. Einhaltung des gerichtlichen Auftrags'],
    ['st-feststellungen', '10. Einzelne Feststellungen begründet'],
    ['st-trennung',       '11. Trennung Tatsachen / Angaben Dritter / Bewertung'],
    ['st-widerspruch',    '12. Widersprüchliche Angaben berücksichtigt'],
    ['st-fair',           '13. Fairer und respektvoller Umgang'],
    ['st-sichtweise',     '14. Gelegenheit, eigene Sichtweise einzubringen'],
    ['st-kommunikation',  '15. Kommunikation während der Begutachtung'],
    ['st-einwaende',      '16. Fehler und Einwände geprüft'],
    ['st-herleitung',     '17. Fachliche Herleitung der Schlussfolgerungen'],
    ['st-belege',         '18. Schlussfolgerungen belegt'],
    ['st-neutral',        '19. Neutralität und Ausgewogenheit'],
    ['st-gesamt',         '20. Gutachten insgesamt nachvollziehbar']
  ];

  var formular = document.getElementById('bewertung-formular');
  if (!formular) return;

  function sterneText(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) { s += (i <= n ? '★' : '☆'); }
    return s + ' (' + n + ' von 5)';
  }

  function wert(name) {
    var g = formular.querySelector('input[name="' + name + '"]:checked');
    return g ? parseInt(g.value, 10) : 0;
  }

  formular.addEventListener('submit', function (e) {
    e.preventDefault();

    var art  = document.getElementById('g-art').value;
    var name = document.getElementById('g-name').value.trim();
    var ort  = document.getElementById('g-ort').value.trim();
    var text = document.getElementById('g-text').value.trim();
    var von  = document.getElementById('g-von').value.trim();

    var zeilen = [];
    zeilen.push('Kategorie: ' + art);
    zeilen.push('Name der Person: ' + name);
    if (ort) { zeilen.push('Ort: ' + ort); }
    zeilen.push('');
    zeilen.push('STERNE-BEWERTUNG');

    var summe = 0, anzahl = 0, offen = [];
    FRAGEN.forEach(function (f) {
      var n = wert(f[0]);
      if (n) { summe += n; anzahl++; zeilen.push('  ' + f[1] + ': ' + sterneText(n)); }
      else   { offen.push(f[1].split('.')[0]); }
    });
    if (!anzahl) { zeilen.push('  (keine Frage bewertet)'); }
    if (offen.length) {
      zeilen.push('  Nicht beantwortet: Frage ' + offen.join(', '));
    }
    if (anzahl) {
      zeilen.push('  ----');
      zeilen.push('  Rechnerischer Mittelwert (ungewichtet): ' +
                  (summe / anzahl).toFixed(1).replace('.', ',') +
                  ' von 5, aus ' + anzahl + ' von 20 beantworteten Fragen');
    }

    zeilen.push('');
    zeilen.push('KOMMENTAR');
    zeilen.push(text);
    zeilen.push('');
    zeilen.push('Veröffentlichen bitte als: ' + von);
    zeilen.push('');
    zeilen.push('---');
    zeilen.push('Gesendet über das Bewertungsformular auf systemfehlerfamilie.de');
    zeilen.push('Die Angaben sind die persönliche Wahrnehmung der einsendenden Person.');

    var betreff = 'Bewertung: ' + name + (ort ? ' (' + ort + ')' : '');
    var url = 'mailto:' + EMPFAENGER +
              '?subject=' + encodeURIComponent(betreff) +
              '&body=' + encodeURIComponent(zeilen.join('\n'));

    if (url.length > 7000) {
      // Sehr lange Kommentare sprengen manche E-Mail-Programme: Text in die
      // Zwischenablage legen und ohne Rumpftext oeffnen.
      var kurz = 'mailto:' + EMPFAENGER + '?subject=' + encodeURIComponent(betreff);
      var einfuegen = function () {
        alert('Ihr Kommentar ist sehr lang. Die vollständige Bewertung liegt jetzt in der ' +
              'Zwischenablage – bitte im E-Mail-Programm mit Strg+V bzw. Cmd+V einfügen.');
        window.location.href = kurz;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(zeilen.join('\n')).then(einfuegen, einfuegen);
      } else {
        einfuegen();
      }
      return;
    }
    window.location.href = url;
  });

  /* Klick auf einen bereits gewählten Stern hebt die Auswahl wieder auf. */
  formular.addEventListener('click', function (e) {
    var ziel = e.target.closest ? e.target.closest('label') : null;
    if (!ziel || !ziel.htmlFor) return;
    var feld = document.getElementById(ziel.htmlFor);
    if (feld && feld.type === 'radio' && feld.checked) {
      setTimeout(function () { feld.checked = false; }, 0);
    }
  });
})();
