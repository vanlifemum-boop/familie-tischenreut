// Berater-Suche: einfache Live-Filterung nach Name/Ort/Thema.
// Daten kommen aus js/berater-daten.js (BERATER).
(function () {
  var listEl = document.getElementById("berater-liste");
  if (!listEl) return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function karte(eintrag) {
    var el = document.createElement("article");
    el.className = "berater-card";

    var buchen = (eintrag.kalenderLink && /^https:\/\//.test(eintrag.kalenderLink))
      ? '<a class="btn btn--primary berater-buchen" href="' + esc(eintrag.kalenderLink) + '" target="_blank" rel="noopener">Termin buchen →</a>'
      : '<p class="guta-keine" style="text-align:left;padding:0;">Kalender folgt in Kürze.</p>';

    el.innerHTML =
      '<div class="guta-head">' +
        '<h3>' + esc(eintrag.name) + '</h3>' +
        '<span class="guta-ort">' + esc(eintrag.ort || '') + '</span>' +
      '</div>' +
      (eintrag.thema ? '<div class="guta-fach berater-thema">' + esc(eintrag.thema) +
        (eintrag.preis ? ' <span class="berater-preis">· ' + esc(eintrag.preis) + '</span>' : '') + '</div>' : '') +
      (eintrag.erfahrung ? '<p class="berater-erfahrung">' + esc(eintrag.erfahrung) + '</p>' : '') +
      '<div class="berater-buchen-zeile">' + buchen + '</div>';
    return el;
  }

  function render(filterText) {
    listEl.innerHTML = "";
    var q = (filterText || "").trim().toLowerCase();
    var treffer = BERATER.filter(function (e) {
      if (!q) return true;
      var hay = (e.name + " " + (e.ort || "") + " " + (e.thema || "")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    if (!treffer.length) {
      var p = document.createElement("p");
      p.className = "guta-keine";
      p.textContent = "Keine Einträge gefunden.";
      listEl.appendChild(p);
      return;
    }
    treffer.forEach(function (e) { listEl.appendChild(karte(e)); });
  }

  if (typeof BERATER !== "undefined") {
    var suchfeld = document.getElementById("berater-suchfeld");
    render("");
    if (suchfeld) suchfeld.addEventListener("input", function () { render(suchfeld.value); });
  }
})();
