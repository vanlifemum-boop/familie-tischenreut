document.querySelectorAll('[data-copy]').forEach(function (button) {
  button.addEventListener('click', async function () {
    var target = document.getElementById(button.getAttribute('data-copy'));
    var status = document.getElementById('copy-status');
    if (!target || !status) return;
    try {
      await navigator.clipboard.writeText(target.innerText.trim());
      button.textContent = 'Kopiert';
      status.textContent = 'Mustertext kopiert. Bitte Platzhalter ausfüllen und nicht passende Abschnitte entfernen.';
      window.setTimeout(function () { button.textContent = 'Mustertext kopieren'; }, 2400);
    } catch (_) {
      var range = document.createRange();
      range.selectNodeContents(target);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Der Mustertext ist markiert. Du kannst ihn über die Kopierfunktion deines Geräts übernehmen.';
    }
  });
});
