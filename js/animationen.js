// Animationen: Scroll-Reveal für Karten/Sektionen + Scroll-Text-Effekt.
// Läuft auf allen Seiten; respektiert "Bewegung reduzieren" im System.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  /* ---------- 1) Scroll-Reveal ---------- */
  var targets = document.querySelectorAll(
    ".post-card, .thema, .page-head, .solidar, .note, .featured article, .momente"
  );
  targets.forEach(function (el, i) {
    el.classList.add("reveal");
    // leichte Staffelung innerhalb von Rastern
    var d = i % 3;
    if (d === 1) el.classList.add("reveal-delay-1");
    if (d === 2) el.classList.add("reveal-delay-2");
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 2) Scroll-Text (Worte leuchten beim Scrollen auf) ---------- */
  var st = document.querySelector(".scrolltext p.st-text");
  if (!st) return;

  // Text in Wort-Spans zerlegen; *Wort* => hervorgehoben (orange)
  var raw = st.textContent.trim().split(/\s+/);
  st.textContent = "";
  var words = raw.map(function (w) {
    var span = document.createElement("span");
    span.className = "st-word";
    if (w.charAt(0) === "*" && w.charAt(w.length - 1) === "*" && w.length > 2) {
      span.classList.add("hl");
      w = w.slice(1, -1);
    }
    span.textContent = w;
    st.appendChild(span);
    st.appendChild(document.createTextNode(" "));
    return span;
  });

  function onScroll() {
    var rect = st.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // Fortschritt: 0 wenn Textanfang unten erscheint, 1 wenn Textende bei 30% Höhe
    var start = vh * 0.85;
    var end = vh * 0.25;
    var progress = (start - rect.top) / (rect.height + (start - end));
    progress = Math.max(0, Math.min(1, progress));
    var lit = Math.floor(progress * words.length);
    words.forEach(function (w, i) {
      w.classList.toggle("lit", i < lit);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
