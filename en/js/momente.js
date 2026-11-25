// "Momente" – animierter Foto-Stapel (Karussell) mit Geschichte dahinter.
// NEUES FOTO HINZUFÜGEN: Bild in den Ordner img/momente/ hochladen und unten
// einen Eintrag ergänzen: img (Dateipfad), titel, text, link (Beitrag/Seite).
// Fehlt die Bilddatei (noch), zeigt der Stapel automatisch eine Titelkarte.
(function () {
  var MOMENTE = [
    {
      img: "/img/momente/20161022_143934.jpg",
      titel: "A team from the start",
      text: "A mother and her boy, inseparable from the very first moment.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/IMG-20200411-WA0036.jpg",
      titel: "Gentle friends",
      text: "Feeding a deer by hand, with courage and gentleness.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/IMG-20210805-WA0016.jpg",
      titel: "Paris together",
      text: "Outside the Louvre, discovering the world hand in hand.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20211002_121939.jpg",
      titel: "Venice",
      text: "Canals, bridges and wide eyes. Journeys you remember.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20191222_133611.jpg",
      titel: "On skates",
      text: "First steps on the ice, as proud as a world champion.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20181217_152202.jpg",
      titel: "Traditions",
      text: "Dressed as little St Nicholas. Celebrations and traditions were always part of our lives.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20250304_130308.jpg",
      titel: "Carnival together",
      text: "Dressing up, laughing and celebrating. A colourful childhood full of celebrations.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20241017_112337.jpg",
      titel: "Big hugs",
      text: "Trips where even the biggest bear wanted to be in the photo.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/received_1094940331442138.jpg",
      titel: "Barefoot summer",
      text: "Dirty feet, a cheeky grin and blue skies. That is the sound of freedom.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20211224_123235.jpg",
      titel: "Christmas",
      text: "Presents under the tree and eyes all aglow. Then suddenly it all ends.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/_MG_8204_1.jpg",
      titel: "Mum and me",
      text: "A portrait that says it all: we belong together.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/Snapchat-685566802.jpg",
      titel: "Pony riding",
      text: "Small adventures, big memories and wholehearted encouragement.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20220801_093559.jpg",
      titel: "In front of Lady Justice",
      text: "The two of us before the goddess of justice, more important today than ever.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/carj6bfpf_0006.jpg",
      titel: "Master of funny faces",
      text: "A photo booth, silly glasses and laughing until we cried. That is our sense of humour.",
      link: "/meine-geschichte.html"
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
