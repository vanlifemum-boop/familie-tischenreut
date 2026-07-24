// Gutachter- und Anwalts-Suche: Live-Filterung nach Name/Ort + Bewertungen.
// Daten kommen aus js/gutachter-daten.js (GUTACHTER, ANWAELTE).
// Kommentare können optional ein Feld { sterne: 1..5 } tragen; daraus wird
// pro Eintrag automatisch eine Durchschnittsbewertung berechnet und angezeigt.
(function () {
  var g = document.getElementById("gutachter-liste");
  var a = document.getElementById("anwaelte-liste");
  if (!g && !a) return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }
  // Escaping für Attributwerte (Anführungszeichen mit)
  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Sterne-HTML für einen Wert 0..5 (gerundet für die Füllung)
  function sterne(n) {
    var full = Math.round(n), s = "";
    for (var i = 1; i <= 5; i++) {
      s += '<span class="' + (i <= full ? "st-full" : "st-empty") + '">★</span>';
    }
    return s;
  }

  function karte(eintrag, art) {
    var el = document.createElement("article");
    el.className = "guta-card";

    var kontaktZeile = art === "gutachter"
      ? (eintrag.adresse ? '<div class="guta-adresse">' + esc(eintrag.adresse) + '</div>' : '')
      : (eintrag.kontakt ? '<div class="guta-adresse">' + esc(eintrag.kontakt) + '</div>' : '');

    // Durchschnittsbewertung aus den Kommentar-Sternen
    var werte = (eintrag.kommentare || [])
      .map(function (k) { return k.sterne; })
      .filter(function (n) { return typeof n === "number" && n >= 1 && n <= 5; });
    var schnittHtml = "";
    if (werte.length) {
      var avg = werte.reduce(function (x, y) { return x + y; }, 0) / werte.length;
      schnittHtml =
        '<div class="guta-sterne">' + sterne(avg) +
        '<span class="guta-sterne-zahl">' + avg.toFixed(1).replace(".", ",") +
        " von 5 · " + werte.length + " Bewertung" + (werte.length > 1 ? "en" : "") +
        "</span></div>";
    }

    var kommentare = (eintrag.kommentare || []).map(function (k) {
      var st = (typeof k.sterne === "number" && k.sterne >= 1 && k.sterne <= 5)
        ? '<div class="guta-sterne guta-sterne--klein">' + sterne(k.sterne) + "</div>" : "";
      return '<li class="guta-kommentar">' + st + '<p>„' + esc(k.text) + '"</p>' +
             '<span>— ' + esc(k.von || "anonym") + "</span></li>";
    }).join("");

    var quelleZeile = "";
    if (eintrag.quelle && /^https:\/\//.test(eintrag.quelle.url || "")) {
      quelleZeile = '<p class="guta-quelle">Hinweis: Zu dieser Person liegen extern veröffentlichte ' +
        "Erfahrungsberichte Dritter vor. Es handelt sich um persönliche Einzelmeinungen, nicht um " +
        'gerichtlich festgestellte Tatsachen. <a href="' + escAttr(eintrag.quelle.url) + '" target="_blank" rel="noopener nofollow">' +
        esc(eintrag.quelle.label || "Quelle ansehen") + " ↗</a></p>";
    }

    var btn = '<button type="button" class="guta-bewerten" data-name="' + escAttr(eintrag.name) +
              '" data-art="' + art + '">★ Bewerten / Kommentieren</button>';

    el.innerHTML =
      '<div class="guta-head">' +
        "<h3>" + esc(eintrag.name) + "</h3>" +
        '<span class="guta-ort">' + esc(eintrag.ort || "") + "</span>" +
      "</div>" +
      (eintrag.fachrichtung ? '<div class="guta-fach">' + esc(eintrag.fachrichtung) + "</div>" : "") +
      kontaktZeile +
      schnittHtml +
      (kommentare ? '<ul class="guta-kommentare">' + kommentare + "</ul>" : "") +
      quelleZeile +
      btn;
    return el;
  }

  function render(listEl, daten, filterText) {
    listEl.innerHTML = "";
    var q = (filterText || "").trim().toLowerCase();
    var art = listEl.id === "gutachter-liste" ? "gutachter" : "anwalt";
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
    treffer.forEach(function (e) { listEl.appendChild(karte(e, art)); });
  }

  // Klick auf "Bewerten" → Formular vorbefüllen und dorthin scrollen
  function bewerten(name, art) {
    var artSel = document.getElementById("g-art");
    if (artSel) artSel.value = (art === "anwalt") ? "Anwalt/Anwältin" : "Gutachter/in";
    var nm = document.getElementById("g-name");
    if (nm) nm.value = name;
    var form = document.getElementById("guta-formular");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
    var txt = document.getElementById("g-text");
    if (txt) setTimeout(function () { txt.focus(); }, 450);
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest(".guta-bewerten") : null;
    if (b) bewerten(b.getAttribute("data-name"), b.getAttribute("data-art"));
  });

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
