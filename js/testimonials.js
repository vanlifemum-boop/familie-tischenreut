// Animierte "Stimmen" (Testimonials) – reiner JS-Nachbau, ohne Framework.
// Inhalte einfach in der Liste unten ändern. Für echte Fotos: bei "img" den
// Pfad zu Ihrem Bild eintragen (z. B. "img/oma.jpg"); ist "img" leer, werden
// die Initialen angezeigt.
(function () {
  var STIMMEN = [
    {
      quote: "Immer wenn ich eure Bilder sehe, muss ich lächeln. Danke, dass ihr uns so teilhaben lasst!",
      name: "Oma Traudl",
      role: "aus Regensburg",
      img: ""
    },
    {
      quote: "Eure Ausflüge machen richtig Lust, selbst mal wieder rauszukommen. Weiter so!",
      name: "Familie Berger",
      role: "unsere Nachbarn",
      img: ""
    },
    {
      quote: "Die herzlichste Familienseite, die ich kenne – echt und liebevoll gemacht.",
      name: "Tante Kathi",
      role: "aus München",
      img: ""
    },
    {
      quote: "Auch über die Entfernung fühlen wir uns euch ganz nah. Danke für die schönen Einblicke.",
      name: "Onkel Peter",
      role: "aus Hamburg",
      img: ""
    }
  ];

  var root = document.getElementById("stimmen");
  if (!root) return;

  var mediaEl = root.querySelector(".t-media");
  var quoteEl = root.querySelector(".t-quote");
  var nameEl = root.querySelector(".t-name");
  var roleEl = root.querySelector(".t-role");
  var current = 0;
  var timer = null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }

  // Foto-Karten einmalig erzeugen
  var photos = STIMMEN.map(function (s, i) {
    var p = document.createElement("div");
    p.className = "t-photo";
    if (s.img) {
      var im = document.createElement("img");
      im.src = s.img;
      im.alt = "Foto von " + s.name;
      p.appendChild(im);
    } else {
      p.textContent = initials(s.name);
    }
    mediaEl.appendChild(p);
    return p;
  });

  function renderQuote(text) {
    quoteEl.innerHTML = "";
    quoteEl.classList.remove("animate");
    var words = text.split(" ");
    words.forEach(function (w, i) {
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = w + (i < words.length - 1 ? " " : "");
      if (!reduce) { span.style.animationDelay = (i * 0.03) + "s"; }
      quoteEl.appendChild(span);
    });
    // Reflow erzwingen, damit die Animation neu startet
    void quoteEl.offsetWidth;
    quoteEl.classList.add("animate");
  }

  function show(index) {
    var len = STIMMEN.length;
    current = (index + len) % len;
    photos.forEach(function (p, i) {
      p.classList.remove("is-active", "is-prev", "is-next");
      if (i === current) p.classList.add("is-active");
      else if (i === (current - 1 + len) % len) p.classList.add("is-prev");
      else if (i === (current + 1) % len) p.classList.add("is-next");
    });
    var s = STIMMEN[current];
    renderQuote(s.quote);
    nameEl.textContent = s.name;
    roleEl.textContent = s.role;
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  function startAuto() {
    if (reduce) return;
    stopAuto();
    timer = setInterval(next, 6000);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  root.querySelector(".t-next").addEventListener("click", function () { next(); startAuto(); });
  root.querySelector(".t-prev").addEventListener("click", function () { prev(); startAuto(); });
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);

  show(0);
  startAuto();
})();
