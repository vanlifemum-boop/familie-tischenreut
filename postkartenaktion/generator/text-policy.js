(function (root) {
  'use strict';
  // A limited local word check, not a contextual or legal assessment.
  // Keep whole-word boundaries so ordinary names and words are not substrings.
  const blocked = /(?:^|[^a-z])(?:arschloe?ch(?:er|ern)?|arschloch|hurensoe?hne?n?|hurensohn|wichser(?:in(?:nen)?|n)?|missgeburt(?:en)?|vollidiot(?:en|in(?:nen)?)?|idiot(?:en|in(?:nen)?)?|dummkoe?pfe?n?|dummkopf|drecksau|drecksaeue|drecksack|drecksaecke|bastard(?:e|en)?|schlampe(?:n)?|schwuchtel(?:n)?|spast(?:i|is|en)?|fotze(?:n)?|neger(?:in(?:nen)?|n)?|kanak(?:e|en)|untermensch(?:en)?)(?=$|[^a-z])/;
  const threats = /(?:^|[^a-z])(?:ich|wir) (?:werde|werden) (?:dich|euch|sie) (?:toeten|umbringen)(?=$|[^a-z])|(?:^|[^a-z])(?:bring dich um|haeng dich auf|heil hitler|sieg heil)(?=$|[^a-z])/;
  function normalize(value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase('de')
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
      .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
      .normalize('NFD').replace(/\p{M}/gu,'')
      .replace(/[013457@$]/g,c=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s'}[c]))
      .replace(/\s+/g,' ').trim();
  }
  function isBlocked(value) {
    const normalized=normalize(value);
    // Also catch common punctuation inserted inside a word.
    return [normalized, normalized.replace(/([a-z])[.*_\-]+(?=[a-z])/g,'$1')]
      .some(text=>blocked.test(text)||threats.test(text));
  }
  const message='Bitte formuliere diese Eingabe ohne Beleidigungen, diskriminierende Ausdrücke oder Drohungen. Die PDF wird erst nach der Korrektur erstellt.';
  function findBlocked(fields) {
    return Object.keys(fields).filter(key=>isBlocked(fields[key]));
  }
  function assertAllowed(fields) {
    if (findBlocked(fields).length) throw new Error(message);
  }
  function wordCount(value) {return String(value).trim().split(/\s+/).filter(Boolean).length;}
  function lengthError(title,body) {
    if(title.length>80) return 'Bitte kürze die Überschrift auf höchstens 80 Zeichen.';
    if(body.length>550||wordCount(body)>70) return 'Bitte kürze den Kartentext auf höchstens 70 Wörter und 550 Zeichen, damit er lesbar bleibt.';
    return '';
  }
  root.PostcardTextPolicy={isBlocked,findBlocked,assertAllowed,message,wordCount,lengthError};
})(globalThis);
