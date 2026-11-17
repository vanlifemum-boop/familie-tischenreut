(function () {
  'use strict';
  var form = document.querySelector('.lexikon-suche');
  if (!form) return;
  var input = document.getElementById('lexikon-suchfeld');
  var status = document.getElementById('lexikon-treffer');
  var empty = document.getElementById('lexikon-leer');
  var entries = Array.from(document.querySelectorAll('.lexikon-eintrag'));
  function normalize(value) {
    return value.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').trim();
  }
  var texts = entries.map(function (entry) { return normalize(entry.textContent); });
  function filter() {
    var words = normalize(input.value).split(/\s+/).filter(Boolean);
    var count = 0;
    entries.forEach(function (entry, i) {
      var matches = words.every(function (word) { return texts[i].includes(word); });
      entry.hidden = !matches;
      if (matches) count++;
    });
    status.textContent = count + ' von ' + entries.length + ' Begriffen';
    empty.hidden = count !== 0;
  }
  function revealAnchor() {
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return; }
    var target = document.getElementById(id);
    if (!target || !target.closest('.lexikon-eintrag')) return;
    input.value = '';
    filter();
    target.scrollIntoView({ block: 'start' });
  }
  input.addEventListener('input', filter);
  form.addEventListener('submit', function (event) { event.preventDefault(); filter(); });
  form.querySelector('button').addEventListener('click', function () {
    input.value = '';
    filter();
    input.focus();
  });
  document.querySelector('.lexikon-index').addEventListener('click', function (event) {
    if (!event.target.closest('a[href^="#"]')) return;
    input.value = '';
    filter();
  });
  window.addEventListener('hashchange', revealAnchor);
  form.hidden = false;
  filter();
  if (window.location.hash) revealAnchor();
})();
