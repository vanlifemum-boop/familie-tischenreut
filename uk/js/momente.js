// "Momente" – animierter Foto-Stapel (Karussell) mit Geschichte dahinter.
// NEUES FOTO HINZUFÜGEN: Bild in den Ordner img/momente/ hochladen und unten
// einen Eintrag ergänzen: img (Dateipfad), titel, text, link (Beitrag/Seite).
// Fehlt die Bilddatei (noch), zeigt der Stapel automatisch eine Titelkarte.
(function () {
  var MOMENTE = [
    {
      img: "/img/momente/20161022_143934.jpg",
      titel: "Від початку ми були командою",
      text: "Мама і її хлопчик, нерозлучні від першої миті.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/IMG-20200411-WA0036.jpg",
      titel: "Лагідні друзі",
      text: "Погодувати козулю з руки: мужність і ніжність в одну мить.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/IMG-20210805-WA0016.jpg",
      titel: "Разом у Парижі",
      text: "Перед Лувром: відкривати світ рука в руці.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20211002_121939.jpg",
      titel: "Венеція",
      text: "Канали, мости й широко розплющені очі. Подорожі, які залишаються в пам’яті.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20191222_133611.jpg",
      titel: "На ковзанах",
      text: "Перші кроки на льоду й гордість, як у чемпіона світу.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20181217_152202.jpg",
      titel: "Традиції",
      text: "У костюмі маленького Святого Миколая. Свята і звичаї завжди були з нами.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20250304_130308.jpg",
      titel: "Карнавал разом",
      text: "Переодягання, сміх і свята. Барвисте дитинство, сповнене святкувань.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20241017_112337.jpg",
      titel: "Міцні обійми",
      text: "Поїздки, в яких навіть найбільший ведмідь хотів потрапити на фото.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/received_1094940331442138.jpg",
      titel: "Літо босоніж",
      text: "Брудні ноги, пустотлива усмішка й синє небо. Ось як звучить свобода.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20211224_123235.jpg",
      titel: "Різдво",
      text: "Подарунки під ялинкою, сяючі очі, а тоді раптом усе закінчується.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/_MG_8204_1.jpg",
      titel: "Мама і я",
      text: "Портрет, який говорить усе: ми маємо бути разом.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/Snapchat-685566802.jpg",
      titel: "Катання на поні",
      text: "Маленькі пригоди, великі спогади й турботлива підтримка.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/20220801_093559.jpg",
      titel: "Перед богинею правосуддя",
      text: "Ми обоє перед богинею правосуддя. Сьогодні вона важливіша, ніж будь-коли.",
      link: "/meine-geschichte.html"
    },
    {
      img: "/img/momente/carj6bfpf_0006.jpg",
      titel: "Майстер гримас",
      text: "Фотобудка, кумедні окуляри й сміх до сліз. Ось який у нас гумор.",
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
