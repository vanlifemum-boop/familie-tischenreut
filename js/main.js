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
