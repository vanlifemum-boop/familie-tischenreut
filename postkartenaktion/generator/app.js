(async function () {
  const el = id => document.getElementById(id);
  const motifs = [{id:'rot',name:'Weihnachtsrot und Gold'},{id:'eis',name:'Eisblau und Silber'},{id:'fenster',name:'Adventsfenster'},{id:'gruen',name:'Weihnachtsgrün · fünf Jungen'},{id:'malen',name:'Zum Ausmalen'}];
  const tips = {glue:'A4 hoch, einseitig und 100 %. Vorder- und Rückseite ausschneiden und zusammenkleben.',duplex:'A4 hoch, 100 %, beidseitig an der langen Kante wenden. Zuerst ein Probeblatt drucken.',manual:'A4 hoch und 100 %. Erst Seite 1 drucken, dasselbe Blatt passend einlegen, dann Seite 2. Die Einlegerichtung am Probeblatt prüfen.',a6:'A6 quer und 100 %. Bei Duplex zunächst kurze Kante wählen und testen. Für das vollständige Motiv ist randloser A6-Druck nötig.'};
  let recipients, texts;
  const cache = new Map();
  function bytes(path) {
    if(!cache.has(path)) cache.set(path,fetch(path).then(r=>{if(!r.ok) throw new Error('Die Druckvorlage konnte nicht geladen werden. Bitte erneut versuchen.');return r.arrayBuffer();}).catch(e=>{cache.delete(path);throw e;}));
    return cache.get(path);
  }
  function motif() {return document.querySelector('input[name="motif"]:checked').value;}
  const drafts = new Map();
  let activeText = '0';
  function selectedText() {
    return {title:el('custom-title').value.trim(),paragraphs:[]};
  }
  function chooseText() {
    drafts.set(activeText,{title:el('custom-title').value,body:el('extra').value});
    activeText=el('text-choice').value;
    const draft=drafts.get(activeText) || (activeText==='custom' ? {title:'',body:''} : {title:texts[Number(activeText)].title,body:texts[Number(activeText)].paragraphs.join('\n\n')});
    el('custom-title').value=draft.title;el('extra').value=draft.body;update();
  }
  function validateText() {
    const fields={'custom-title':el('custom-title').value,extra:el('extra').value,address:el('address').value,attention:el('attention').value};
    const blocked=PostcardTextPolicy.findBlocked(fields);
    const lengthError=PostcardTextPolicy.lengthError(fields['custom-title'],fields.extra);
    for(const id of Object.keys(fields)) {
      el(id).setCustomValidity(blocked.includes(id)?PostcardTextPolicy.message:((id==='extra'||id==='custom-title')?lengthError:''));
      el(id).setAttribute('aria-invalid',String(blocked.includes(id)||((id==='extra'||id==='custom-title')&&!!lengthError)));
    }
    el('text-validation').textContent=blocked.length?PostcardTextPolicy.message:lengthError;
    return blocked.length===0&&!lengthError;
  }
  function update() {
    const text=selectedText();
    el('text-count').textContent=PostcardTextPolicy.wordCount(el('extra').value)+' / 70 Wörter · '+el('extra').value.length+' / 550 Zeichen';
    el('front-preview').src='generator/assets/'+motif()+'.png';
    const selectedMotif=motifs.find(item=>item.id===motif());
    el('front-preview').alt='Gewähltes Postkartenmotiv: '+selectedMotif.name;
    el('selected-motif').textContent=selectedMotif.name;
    el('preview-title').textContent=text.title;
    el('preview-title').hidden=!text.title;
    el('preview-body').textContent=text.paragraphs.join('\n\n');
    el('preview-body').hidden=!text.paragraphs.length;
    el('preview-extra').textContent=el('extra').value;
    el('preview-dedication').hidden=!el('dedication').checked;
    el('preview-address').textContent=PostcardAddress.format(el('address').value,el('attention').value) || 'Adresse später von Hand ergänzen';
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
    [recipients,texts]=await Promise.all(['recipients.json','texts.json'].map(name=>fetch('generator/'+name+'?v=gruen-gruss-1').then(r=>{if(!r.ok) throw new Error('Laden fehlgeschlagen');return r.json();})));
    motifs.forEach((item,index)=>{
      const label=document.createElement('label');label.className='motif';
      const img=document.createElement('img');img.src='generator/assets/'+item.id+'.png';img.alt='';img.width=1491;img.height=1055;
      const line=document.createElement('span'),input=document.createElement('input');input.type='radio';input.name='motif';input.value=item.id;input.checked=index===0;
      input.setAttribute('form','card-form');
      line.append(input,document.createTextNode(item.name));label.append(img,line);el('motifs').append(label);
    });
    texts.forEach((text,index)=>el('text-choice').add(new Option(text.title,index)));
    el('text-choice').add(new Option('Nur eigener Text / leere Textfläche','custom'));
    el('custom-title').value=texts[0].title;el('extra').value=texts[0].paragraphs.join('\n\n');
    filterRecipients();update();el('download').disabled=false;el('status').textContent='49 Empfänger stehen zur Auswahl.';
  }catch(error){el('status').textContent='Der Generator konnte nicht geladen werden. Bitte lade die Seite erneut.';return;}
  el('text-choice').addEventListener('change',chooseText);
  el('card-form').addEventListener('input',update);
  el('motifs').addEventListener('change',update);
  el('recipient-search').addEventListener('input',filterRecipients);
  el('address').addEventListener('input',()=>{el('recipient').value='';});
  el('recipient').addEventListener('change',()=>{const chosen=recipients.find(r=>r.id===el('recipient').value);el('address').value=chosen?chosen.address:'';update();});
  el('card-form').addEventListener('submit',async event=>{
    event.preventDefault();
    if(!validateText()){el('card-form').reportValidity();return;}
    el('download').disabled=true;el('status').textContent='Deine PDF wird erstellt …';
    const selected=motif(),text=selectedText(),mode=el('print-mode').value;
    const state={title:text.title,body:text.paragraphs.join('\n\n'),extra:el('extra').value,address:PostcardAddress.format(el('address').value,el('attention').value),mode,monochrome:selected==='malen',dedication:el('dedication').checked};
    try {
      const [image,fontBytes,qrImage]=await Promise.all([bytes('generator/assets/'+selected+'.png'),bytes('generator/assets/Schrift.ttf'),bytes('downloads/qr-postkartenaktion.png')]);
      const result=await PostcardPDF.build({...state,image,fontBytes,qrImage});
      const url=URL.createObjectURL(new Blob([result],{type:'application/pdf'})),link=document.createElement('a');
      link.href=url;link.download='Kinderrechte-'+selected+'-'+mode+'.pdf';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      el('status').textContent='Deine PDF ist erstellt. '+tips[mode];
    }catch(error){el('status').textContent=error.message || 'Die PDF konnte nicht erstellt werden. Bitte erneut versuchen.';}
    finally{el('download').disabled=false;}
  });
  el('copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el('email').value);el('copy-status').textContent='Der E-Mail-Text ist kopiert.';}catch{el('email').focus();el('email').select();el('copy-status').textContent='Der Text ist markiert. Bitte über das Kontextmenü kopieren.';}});
})();
