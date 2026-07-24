// Gutachter- und Anwalts-Suche: einfache Live-Filterung nach Name/Ort.
// Daten kommen aus js/gutachter-daten.js (GUTACHTER, ANWAELTE).
(function () {
  var g = document.getElementById("gutachter-liste");
  var a = document.getElementById("anwaelte-liste");
  if (!g && !a) return;

  function karte(eintrag, art) {
    var el = document.createElement("article");
    el.className = "guta-card";
    var kontaktZeile = art === "gutachter"
      ? (eintrag.adresse ? '<div class="guta-adresse">' + esc(eintrag.adresse) + '</div>' : '')
      : (eintrag.kontakt ? '<div class="guta-adresse">' + esc(eintrag.kontakt) + '</div>' : '');

    var kommentare = (eintrag.kommentare || []).map(function (k) {
      return '<li class="guta-kommentar"><p>„' + esc(k.text) + '"</p><span>— ' + esc(k.von || 'anonym') + '</span></li>';
    }).join('');

    var quelleZeile = '';
    if (eintrag.quelle && /^https:\/\//.test(eintrag.quelle.url || '')) {
      quelleZeile = '<p class="guta-quelle">Hinweis: Zu dieser Person liegen extern veröffentlichte ' +
        'Erfahrungsberichte Dritter vor. Es handelt sich um persönliche Einzelmeinungen, nicht um ' +
        'gerichtlich festgestellte Tatsachen. <a href="' + esc(eintrag.quelle.url) + '" target="_blank" rel="noopener nofollow">' +
        esc(eintrag.quelle.label || 'Quelle ansehen') + ' ↗</a></p>';
    }

    el.innerHTML =
      '<div class="guta-head">' +
        '<h3>' + esc(eintrag.name) + '</h3>' +
        '<span class="guta-ort">' + esc(eintrag.ort || '') + '</span>' +
      '</div>' +
      (eintrag.fachrichtung ? '<div class="guta-fach">' + esc(eintrag.fachrichtung) + '</div>' : '') +
      kontaktZeile +
      (kommentare ? '<ul class="guta-kommentare">' + kommentare + '</ul>' : '') +
      quelleZeile;
    return el;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function render(listEl, daten, filterText) {
    listEl.innerHTML = "";
    var q = (filterText || "").trim().toLowerCase();
    var treffer = daten.filter(function (e) {
      if (!q) return true;
      var hay = (e.name + " " + (e.ort || "") + " " + (e.fachrichtung || "")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    if (!treffer.length) {
      var p = document.createElement("p");
      p.className = "guta-keine";
      p.textContent = "Keine Einträge gefunden.";
      listEl.appendChild(p);
      return;
    }
    treffer.forEach(function (e) { listEl.appendChild(karte(e, listEl.id === "gutachter-liste" ? "gutachter" : "anwalt")); });
  }

  if (g && typeof GUTACHTER !== "undefined") {
    var gs = document.getElementById("gutachter-suchfeld");
    render(g, GUTACHTER, "");
    if (gs) gs.addEventListener("input", function () { render(g, GUTACHTER, gs.value); });
  }
  if (a && typeof ANWAELTE !== "undefined") {
    var as = document.getElementById("anwaelte-suchfeld");
    render(a, ANWAELTE, "");
    if (as) as.addEventListener("input", function () { render(a, ANWAELTE, as.value); });
  }
})();
