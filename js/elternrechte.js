(() => {
  const search = document.querySelector('#recht-suche');
  const category = document.querySelector('#recht-bereich');
  if (!search || !category) return;
  const cards = [...document.querySelectorAll('[data-recht-card]')];
  const status = document.querySelector('#recht-anzahl');
  const empty = document.querySelector('#recht-leer');
  const normalize = value => value.toLocaleLowerCase('de').replace(/ß/g, 'ss').replace(/§\s*/g, '§').replace(/-/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function filter() {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const text = normalize(card.textContent + ' ' + (card.dataset.keywords || ''));
      const show = (!category.value || card.dataset.category === category.value) && terms.every(term => text.includes(term));
      card.hidden = !show;
      if (show) count++;
    });
    status.textContent = count + ' von ' + cards.length + ' Erklärungen';
    empty.hidden = count > 0;
  }
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  document.querySelector('#recht-zuruecksetzen').addEventListener('click', () => {
    search.value = ''; category.value = ''; filter(); search.focus();
  });
  document.querySelector('#recht-filter').hidden = false;
  filter();
})();
