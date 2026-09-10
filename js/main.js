// Kleines Skript: mobiles Menü öffnen/schließen + aktuelles Jahr im Footer
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var expanded = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  var year = document.getElementById("year");
  if (year) { year.textContent = new Date().getFullYear(); }
});

// Datensparsame, anonyme Seitenaufruf-Statistik
(function () {
  var allowedHosts = ["systemfehlerfamilie.de", "www.systemfehlerfamilie.de"];
  if (allowedHosts.indexOf(window.location.hostname) === -1) { return; }

  try {
    var currentUrl = new URL(window.location.href);
    var preference = currentUrl.searchParams.get("_sf_stats");

    if (preference === "off") {
      window.localStorage.setItem("sf_stats_opt_out", "1");
    } else if (preference === "on") {
      window.localStorage.removeItem("sf_stats_opt_out");
    }

    if (preference) {
      currentUrl.searchParams.delete("_sf_stats");
      window.history.replaceState(
        null,
        "",
        currentUrl.pathname + currentUrl.search + currentUrl.hash
      );
    }

    if (window.localStorage.getItem("sf_stats_opt_out") === "1") { return; }
  } catch (_) {
    // Falls der Browser lokalen Speicher blockiert, funktioniert die Seite trotzdem.
  }

  var endpoint = "https://systemfehler-statistik.baumgartner344.chatgpt.site/api/track";
  var payload = JSON.stringify({
    path: window.location.pathname,
    title: document.title
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      endpoint,
      new Blob([payload], { type: "text/plain;charset=UTF-8" })
    );
  } else if (window.fetch) {
    window.fetch(endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: payload
    }).catch(function () {});
  }
})();
