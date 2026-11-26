(async function () {
  const el = id => document.getElementById(id);
  const motifs = [{id:'rot',name:'Weihnachtsrot und Gold'},{id:'eis',name:'Eisblau und Silber'},{id:'fenster',name:'Adventsfenster'},{id:'malen',name:'Zum Ausmalen'}];
  const tips = {glue:'A4 hoch, einseitig und 100 %. Vorder- und Rückseite ausschneiden und zusammenkleben.',duplex:'A4 hoch, 100 %, beidseitig an der langen Kante wenden. Zuerst ein Probeblatt drucken.',manual:'A4 hoch und 100 %. Erst Seite 1 drucken, dasselbe Blatt passend einlegen, dann Seite 2. Die Einlegerichtung am Probeblatt prüfen.',a6:'A6 quer und 100 %. Bei Duplex zunächst kurze Kante wählen und testen. Für das vollständige Motiv ist randloser A6-Druck nötig.'};
  let recipients, texts;
  const cache = new Map();
  function bytes(path) {
    if(!cache.has(path)) cache.set(path,fetch(path).then(r=>{if(!r.ok) throw new Error('Die Druckvorlage konnte nicht geladen werden. Bitte erneut versuchen.');return r.arrayBuffer();}).catch(e=>{cache.delete(path);throw e;}));
    return cache.get(path);
  }
  function motif() {return document.querySelector('input[name="motif"]:checked').value;}
  function selectedText() {
    return el('text-choice').value === 'custom'
      ? {title:el('custom-title').value.trim(),paragraphs:[]}
      : texts[Number(el('text-choice').value)];
  }
  function validateText() {
    const custom=el('text-choice').value==='custom';
    const fields={'custom-title':custom?el('custom-title').value:'',extra:el('extra').value,address:el('address').value};
    const blocked=PostcardTextPolicy.findBlocked(fields);
    for(const id of Object.keys(fields)) {
      el(id).setCustomValidity(blocked.includes(id)?PostcardTextPolicy.message:'');
      el(id).setAttribute('aria-invalid',String(blocked.includes(id)));
    }
    el('text-validation').textContent=blocked.length?PostcardTextPolicy.message:'';
    return blocked.length===0;
  }
  function update() {
    const text=selectedText(), custom=el('text-choice').value==='custom';
    el('custom-title-field').hidden=!custom;
    el('extra-label').textContent=custom?'Dein eigener Rückseitentext':'Deine persönliche Ergänzung';
    el('text-help').textContent=custom
      ? 'Dein Text wird direkt in die PDF gedruckt. Lass die Felder leer, wenn du eine leere Textfläche möchtest.'
      : 'Deine Ergänzung wird unter dem gewählten Vorlagentext direkt in die PDF gedruckt.';
    el('front-preview').src='generator/assets/'+motif()+'.png';
    el('preview-title').textContent=text.title;
    el('preview-title').hidden=!text.title;
    el('preview-body').textContent=text.paragraphs.join('\n\n');
    el('preview-body').hidden=!text.paragraphs.length;
    el('preview-extra').textContent=el('extra').value;
    el('preview-address').textContent=el('address').value || 'Adresse später von Hand ergänzen';
    el('print-tip').textContent=tips[el('print-mode').value];
    validateText();
  }
  function filterRecipients() {
    const selected=el('recipient').value, query=el('recipient-search').value.toLocaleLowerCase('de');
    el('recipient').replaceChildren(new Option('Eigene Adresse oder ohne Adresse',''));
    const groups=new Map();
    for(const recipient of recipients) {
      if(recipient.id!==selected && !(recipient.name+' '+recipient.group+' '+recipient.address).toLocaleLowerCase('de').includes(query)) continue;
      if(!groups.has(recipient.group)) {const group=document.createElement('optgroup');group.label=recipient.group;groups.set(recipient.group,group);el('recipient').append(group);}
      groups.get(recipient.group).append(new Option(recipient.name,recipient.id));
    }
    if(Array.from(el('recipient').options).some(o=>o.value===selected)) el('recipient').value=selected;
  }
  el('download').disabled=true;
  try {
    [recipients,texts]=await Promise.all(['recipients.json','texts.json'].map(name=>fetch('generator/'+name).then(r=>{if(!r.ok) throw new Error('Laden fehlgeschlagen');return r.json();})));
    motifs.forEach((item,index)=>{
      const label=document.createElement('label');label.className='motif';
      const img=document.createElement('img');img.src='generator/assets/'+item.id+'.png';img.alt=item.name;img.width=1491;img.height=1055;
      const line=document.createElement('span'),input=document.createElement('input');input.type='radio';input.name='motif';input.value=item.id;input.checked=index===0;
      line.append(input,document.createTextNode(item.name));label.append(img,line);el('motifs').append(label);
    });
    texts.forEach((text,index)=>el('text-choice').add(new Option(text.title,index)));
    el('text-choice').add(new Option('Nur eigener Text / leere Textfläche','custom'));
    filterRecipients();update();el('download').disabled=false;el('status').textContent='49 Empfänger stehen zur Auswahl.';
  }catch(error){el('status').textContent='Der Generator konnte nicht geladen werden. Bitte lade die Seite erneut.';return;}
  el('card-form').addEventListener('input',update);
  el('recipient-search').addEventListener('input',filterRecipients);
  el('address').addEventListener('input',()=>{el('recipient').value='';});
  el('recipient').addEventListener('change',()=>{const chosen=recipients.find(r=>r.id===el('recipient').value);el('address').value=chosen?chosen.address:'';update();});
  el('card-form').addEventListener('submit',async event=>{
    event.preventDefault();
    if(!validateText()){el('card-form').reportValidity();return;}
    el('download').disabled=true;el('status').textContent='Deine PDF wird erstellt …';
    const selected=motif(),text=selectedText(),mode=el('print-mode').value;
    const state={title:text.title,body:text.paragraphs.join('\n\n'),extra:el('extra').value,address:el('address').value,mode,monochrome:selected==='malen'};
    try {
      const [image,fontBytes]=await Promise.all([bytes('generator/assets/'+selected+'.png'),bytes('generator/assets/Schrift.ttf')]);
      const result=await PostcardPDF.build({...state,image,fontBytes});
      const url=URL.createObjectURL(new Blob([result],{type:'application/pdf'})),link=document.createElement('a');
      link.href=url;link.download='Kinderrechte-'+selected+'-'+mode+'.pdf';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      el('status').textContent='Deine PDF ist erstellt. '+tips[mode];
    }catch(error){el('status').textContent=error.message || 'Die PDF konnte nicht erstellt werden. Bitte erneut versuchen.';}
    finally{el('download').disabled=false;}
  });
  el('copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el('email').value);el('copy-status').textContent='Der E-Mail-Text ist kopiert.';}catch{el('email').focus();el('email').select();el('copy-status').textContent='Der Text ist markiert. Bitte über das Kontextmenü kopieren.';}});
})();
