// "Momente" – animierter Foto-Stapel (Karussell) mit Geschichte dahinter.
// NEUES FOTO HINZUFÜGEN: Bild in den Ordner img/momente/ hochladen und unten
// einen Eintrag ergänzen: img (Dateipfad), titel, text, link (Beitrag/Seite).
// Fehlt die Bilddatei (noch), zeigt der Stapel automatisch eine Titelkarte.
(function () {
  var MOMENTE = [
    {
      img: "img/momente/20161022_143934.jpg",
      titel: "Von Anfang an ein Team",
      text: "Mama und ihr Junge – von der ersten Stunde an unzertrennlich.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/IMG-20200411-WA0036.jpg",
      titel: "Sanfte Freunde",
      text: "Ein Reh aus der Hand füttern – Mut und Zartheit zugleich.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/IMG-20210805-WA0016.jpg",
      titel: "Paris zusammen",
      text: "Vor dem Louvre: die Welt entdecken, Hand in Hand.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/20211002_121939.jpg",
      titel: "Venedig",
      text: "Kanäle, Brücken, große Augen – Reisen, die bleiben.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/20191222_133611.jpg",
      titel: "Auf Kufen",
      text: "Erste Schritte auf dem Eis – stolz wie ein Weltmeister.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/20181217_152202.jpg",
      titel: "Traditionen",
      text: "Als kleiner Nikolaus – Feste und Bräuche gehörten immer dazu.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/20250304_130308.jpg",
      titel: "Karneval zusammen",
      text: "Verkleiden, lachen, feiern – eine bunte Kindheit voller Feste.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/20241017_112337.jpg",
      titel: "Große Umarmungen",
      text: "Ausflüge, bei denen selbst der größte Bär mit aufs Foto wollte.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/received_1094940331442138.jpg",
      titel: "Barfuß-Sommer",
      text: "Dreckige Füße, freches Grinsen, blauer Himmel – so klingt Freiheit.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/20211224_123235.jpg",
      titel: "Weihnachten",
      text: "Geschenke unterm Baum, leuchtende Augen – und plötzlich endet alles.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/_MG_8204_1.jpg",
      titel: "Mama & ich",
      text: "Ein Porträt, das alles sagt: Wir gehören zusammen.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/Snapchat-685566802.jpg",
      titel: "Ponyreiten",
      text: "Kleine Abenteuer, große Erinnerungen – Förderung mit Herz.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/20220801_093559.jpg",
      titel: "Vor Justitia",
      text: "Wir beide vor der Göttin der Gerechtigkeit – heute wichtiger denn je.",
      link: "meine-geschichte.html"
    },
    {
      img: "img/momente/carj6bfpf_0006.jpg",
      titel: "Grimassen-Meister",
      text: "Fotobox, alberne Brillen, Tränen gelacht – so klingt unser Humor.",
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
