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
  var EMPFAENGER = 'tussyvan@gmail.com';

  var FRAGEN = [
    ['st-aufklaerung',  'Aufklärung'],
    ['st-zuhoeren',     'Zuhören'],
    ['st-kind',         'Umgang mit dem Kind'],
    ['st-unterlagen',   'Unterlagen berücksichtigt'],
    ['st-ausgewogen',   'Ausgewogenheit'],
    ['st-nachvollzieh', 'Nachvollziehbarkeit'],
    ['st-gesamt',       'Gesamteindruck']
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

    var summe = 0, anzahl = 0;
    FRAGEN.forEach(function (f) {
      var n = wert(f[0]);
      if (n) { summe += n; anzahl++; zeilen.push('  ' + f[1] + ': ' + sterneText(n)); }
      else   { zeilen.push('  ' + f[1] + ': keine Angabe'); }
    });
    if (anzahl) {
      zeilen.push('  ----');
      zeilen.push('  Durchschnitt: ' + (summe / anzahl).toFixed(1).replace('.', ',') +
                  ' von 5 (aus ' + anzahl + ' Angaben)');
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

    if (url.length > 1900) {
      url = 'mailto:' + EMPFAENGER + '?subject=' + encodeURIComponent(betreff);
      alert('Ihr Kommentar ist sehr lang. Das E-Mail-Programm öffnet sich jetzt – bitte fügen ' +
            'Sie den Text von Hand ein (Sie können ihn vorher im Formular kopieren).');
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
