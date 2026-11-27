(function (root) {
  const t = key => globalThis.PostcardI18n?.t(key) ?? key;
  function format(address, attention = '') {
    const lines = String(address || '').trim().split(/\r?\n/);
    const name = String(attention || '').trim().replace(/^z\s*\.?\s*h(?:d|dn)\s*\.?\s*|^zu\s+h[aä]nden\s*:?\s*/i, '').trim();
    if (!name) return String(address || '').trim();
    const line = t('z. Hd. ') + name;
    if (!lines[0]) return line;
    lines.splice(1, 0, line);
    return lines.join('\n');
  }
  root.PostcardAddress = {format};
})(globalThis);
