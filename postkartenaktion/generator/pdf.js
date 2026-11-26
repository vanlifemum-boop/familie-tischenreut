(function (root) {
  const mm = 72 / 25.4;
  function lines(text, font, size, width) {
    if (!text.trim()) return [];
    const result = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (font.widthOfTextAtSize((line ? line + ' ' : '') + word, size) <= width) {
          line += (line ? ' ' : '') + word;
        } else {
          if (line) result.push(line);
          line = '';
          for (const char of word) {
            if (font.widthOfTextAtSize(line + char, size) > width && line) {
              result.push(line); line = '';
            }
            line += char;
          }
        }
      }
      result.push(line);
    }
    return result;
  }
  async function build({image, fontBytes, qrImage, title, body, extra = '', address = '', mode = 'duplex', monochrome = false}) {
    if(!root.PostcardTextPolicy) throw new Error('Die Textprüfung konnte nicht geladen werden. Bitte lade die Seite erneut.');
    root.PostcardTextPolicy.assertAllowed({title,body,extra,address});
    const lengthError=root.PostcardTextPolicy.lengthError(title,[body.trim(),extra.trim()].filter(Boolean).join('\n\n'));
    if(lengthError) throw new Error(lengthError);
    if(!qrImage) throw new Error('Der QR-Code konnte nicht geladen werden. Bitte erneut versuchen.');
    const {PDFDocument, rgb} = root.PDFLib;
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(root.fontkit);
    const font = await pdf.embedFont(fontBytes, {subset: true});
    const supported = new Set(font.getCharacterSet());
    for (const char of title + body + extra + address) {
      if (!/\s/.test(char) && !supported.has(char.codePointAt(0))) {
        throw new Error('Das Zeichen „' + char + '“ kann nicht gedruckt werden. Bitte ersetze es in deinem Text oder in der Adresse.');
      }
    }
    const picture = await pdf.embedPng(image);
    const qr = await pdf.embedPng(qrImage);
    const black = rgb(0,0,0), accent = monochrome ? black : rgb(.03,.25,.22);
    const text = [body.trim(), extra.trim()].filter(Boolean).join('\n\n');
    let size = 9.3;
    let textLines = lines(text, font, size, 69*mm);
    const titleLines = lines(title, font, 11.5, 69*mm);
    const titleGap = titleLines.length ? 10 : 0;
    const top = 95*mm - titleLines.length*14 - titleGap;
    while (top - textLines.length*size*1.3 < 23*mm && size > 9) {
      size = Math.max(9, size - .2); textLines = lines(text,font,size,69*mm);
    }
    if (top - textLines.length*size*1.3 < 23*mm) throw new Error('Der Text ist zu lang für die Postkarte. Bitte kürze deinen Text oder die Überschrift, oder wähle einen kürzeren Ausgangstext.');
    const addressLines = lines(address.trim(),font,9,55*mm);
    if (addressLines.length > 12) throw new Error('Die Adresse benötigt zu viele Zeilen. Bitte kürze Zusätze auf höchstens zwölf Zeilen.');
    function drawText(page, content, x, y, fontSize=8, color=black) { page.drawText(content,{x,y,size:fontSize,font,color}); }
    function front(page,x,y) {page.drawImage(picture,{x,y,width:148*mm,height:105*mm});}
    function back(page,x,y) {
      page.drawImage(qr,{x:x+86*mm,y:y+77*mm,width:20*mm,height:20*mm});
      let yText = y+95*mm;
      for (const line of titleLines) {drawText(page,line,x+6*mm,yText,11.5,accent); yText-=14;}
      yText -=titleGap;
      for (const line of textLines) {drawText(page,line,x+6*mm,yText,size); yText-=size*1.3;}
      page.drawLine({start:{x:x+80*mm,y:y+18*mm},end:{x:x+80*mm,y:y+98*mm},thickness:.5,color:accent});
      page.drawRectangle({x:x+124*mm,y:y+76*mm,width:18*mm,height:23*mm,borderColor:accent,borderWidth:.5});
      drawText(page,'Briefmarke',x+126*mm,y+87*mm,6.4);
      drawText(page,'An',x+86*mm,y+67*mm,9);
      let addressY=y+59*mm;
      for(const line of addressLines) {drawText(page,line,x+86*mm,addressY,9);addressY-=10.5;}
      if(!address.trim()) for(let n=0;n<5;n++) page.drawLine({start:{x:x+86*mm,y:y+(57-n*10)*mm},end:{x:x+142*mm,y:y+(57-n*10)*mm},thickness:.4,color:accent});
      drawText(page,'systemfehlerfamilie.de/postkartenaktion/',x+6*mm,y+17*mm,6.2);
    }
    function marks(page,x,y) {
      for(const [cx,dx] of [[x,-1],[x+148*mm,1]]) for(const [cy,dy] of [[y,-1],[y+105*mm,1]]) {
        page.drawLine({start:{x:cx+dx*mm,y:cy},end:{x:cx+4*dx*mm,y:cy},thickness:.4});
        page.drawLine({start:{x:cx,y:cy+dy*mm},end:{x:cx,y:cy+4*dy*mm},thickness:.4});
      }
    }
    if(mode==='a6') {front(pdf.addPage([148*mm,105*mm]),0,0);back(pdf.addPage([148*mm,105*mm]),0,0);}
    else if(mode==='glue') {
      const page=pdf.addPage([210*mm,297*mm]);
      drawText(page,'A4 hoch · Einseitig · 100 % / Tatsächliche Größe',31*mm,280*mm,10);
      front(page,31*mm,162*mm);back(page,31*mm,39*mm);marks(page,31*mm,162*mm);marks(page,31*mm,39*mm);
      drawText(page,'Ausschneiden und die unbedruckten Seiten zusammenkleben.',31*mm,25*mm,8);
      drawText(page,'Fertigformat 148 × 105 mm · QR-Code und weißen Rand frei lassen.',31*mm,17*mm,8);
    } else {
      for(const [draw,label] of [[front,'Vorderseite'],[back,'Rückseite']]) {
        const page=pdf.addPage([210*mm,297*mm]);
        drawText(page,label+' · A4 hoch · 100 % / Tatsächliche Größe',31*mm,275*mm,11);
        drawText(page,mode==='manual'?'Einzelseiten drucken · Einlegerichtung vorher mit einem Probeblatt prüfen.':'Duplexdruck · An der langen Kante wenden.',31*mm,260*mm,8);
        draw(page,31*mm,96*mm);marks(page,31*mm,96*mm);
        drawText(page,'Erst nach dem beidseitigen Druck ausschneiden · 148 × 105 mm.',31*mm,78*mm,8);
      }
    }
    pdf.context.trailerInfo.Info = undefined;
    pdf.context.trailerInfo.ID = undefined;
    return pdf.save();
  }
  root.PostcardPDF = {build};
})(globalThis);
