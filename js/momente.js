// "Momente" – animierter Foto-Stapel (Karussell) mit Geschichte dahinter.
// NEUES FOTO HINZUFÜGEN: Bild in den Ordner img/momente/ hochladen und unten
// einen Eintrag ergänzen: img (Dateipfad), titel, text, link (Beitrag/Seite).
// Fehlt die Bilddatei (noch), zeigt der Stapel automatisch eine Titelkarte.
(function () {
  var MOMENTE = [
    {
      img: "img/momente/aussichtsturm.jpg",
      titel: "Unsere Aussicht",
      text: "Oben auf dem Turm, der Blick über die Wälder – solche Tage gehörten uns.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/leuchtturm.jpg",
      titel: "Lachen am Leuchtturm",
      text: "Ein Sommertag, ein Leuchtturm und ein Lachen, das ansteckt.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/fasching.jpg",
      titel: "Fasching zusammen",
      text: "Verkleiden, quatschen, lachen – eine bunte Kindheit voller Feste.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/baerenumarmung.jpg",
      titel: "Große Umarmungen",
      text: "Ausflüge, bei denen selbst der größte Bär mit aufs Foto wollte.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/weihnachten.jpg",
      titel: "Weihnachten",
      text: "Geschenke unterm Baum, gebastelter Schmuck – und plötzlich endet alles.",
      link: "meine-geschichte.html"
    }
  ];

  var root = document.getElementById("momente");
  if (!root) return;

  var mediaEl = root.querySelector(".m-media");
  var titelEl = root.querySelector(".m-body h3");
  var textEl = root.querySelector(".m-text");
  var linkEl = root.querySelector(".m-link");
  var current = 0;
  var timer = null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var slides = MOMENTE.map(function (m) {
    var s = document.createElement("a");
    s.className = "m-slide";
    s.href = m.link;
    s.setAttribute("aria-label", m.titel);
    if (m.img) {
      var im = document.createElement("img");
      im.src = m.img;
      im.alt = m.titel;
      im.loading = "lazy";
      im.onerror = function () {
        im.remove();
        var fb = document.createElement("div");
        fb.className = "m-fallback";
        fb.textContent = m.titel;
        s.appendChild(fb);
      };
      s.appendChild(im);
    }
    mediaEl.appendChild(s);
    return s;
  });

  function renderText(text) {
    textEl.innerHTML = "";
    textEl.classList.remove("animate");
    text.split(" ").forEach(function (w, i) {
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = w + " ";
      if (!reduce) span.style.animationDelay = (i * 0.035) + "s";
      textEl.appendChild(span);
    });
    void textEl.offsetWidth;
    textEl.classList.add("animate");
  }

  function show(i) {
    var len = MOMENTE.length;
    current = (i + len) % len;
    slides.forEach(function (s, k) {
      s.classList.remove("is-active", "is-prev", "is-next");
      if (k === current) s.classList.add("is-active");
      else if (k === (current - 1 + len) % len) s.classList.add("is-prev");
      else if (k === (current + 1) % len) s.classList.add("is-next");
    });
    var m = MOMENTE[current];
    titelEl.textContent = m.titel;
    renderText(m.text);
    linkEl.href = m.link;
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }
  function startAuto() { if (reduce) return; stopAuto(); timer = setInterval(next, 6500); }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  root.querySelector(".m-next").addEventListener("click", function () { next(); startAuto(); });
  root.querySelector(".m-prev").addEventListener("click", function () { prev(); startAuto(); });
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);

  show(0);
  startAuto();
})();
