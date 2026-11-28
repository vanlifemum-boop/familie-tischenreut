"""Build approved four-up A4 print sheets; run from the repository root.
A4 landscape, 100%, duplex SHORT edge: backs mirror columns, not rows.
"""
from pathlib import Path
from io import BytesIO
import json
from PIL import Image
from reportlab import rl_config
rl_config.useA85 = False
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'postkartenaktion'
pdfmetrics.registerFont(TTFont('Card',str(BASE/'generator/assets/Schrift.ttf')))
TEXTS=json.loads((BASE/'generator/texts.json').read_text())
W,H=140*mm,(140*105/148)*mm
X,Y=(297*mm-2*W)/2,(210*mm-2*H)/2
S=140/148
INK='#102c35'
# All four approved colour motifs; green uses text 1.
CARDS=[('rot',0),('eis',1),('fenster',2),('gruen',0)]
ADDRESS=['SOS-Kinderdorf e. V.','z. Hd. Jörg Faulstich','Vorstandsvorsitzender','Renatastraße 77','80639 München']
# Address and chair verified 2026-11-26:
# https://www.sos-kinderdorf.de/footer/impressum
# https://www.sos-kinderdorf.de/ueber-uns/organisation/struktur-und-gremien
IMAGES={}
for motif,_ in CARDS:
 if motif not in IMAGES:
  image=Image.open(BASE/f'generator/assets/{motif}.png').convert('RGB')
  buf=BytesIO();image.save(buf,format='JPEG',quality=94,subsampling=0)
  IMAGES[motif]=ImageReader(BytesIO(buf.getvalue()))
QR=ImageReader(str(BASE/'downloads/qr-postkartenaktion.png'))
def wrap(text,size,width):
 result=[]
 for para in text.split('\n'):
  line=''
  for word in para.split():
   candidate=(line+' '+word).strip()
   if pdfmetrics.stringWidth(candidate,'Card',size)>(width(len(result)) if callable(width) else width) and line:
    result.append(line);line=word
   else:line=candidate
  result.append(line)
 return result

def back(c,x,y,idx,with_text,with_address):
 c.saveState();c.translate(x,y);c.scale(S,S);c.setFillColor(INK);c.setStrokeColor(INK)
 def text(value,x,y,size):
  c.setFont('Card',size);c.drawString(x*mm,y*mm,value)
 if with_text:
  t=TEXTS[idx];title=wrap(t['title'],11.5,69*mm);size=9.3
  top=95*mm-len(title)*14-10
  body_width=lambda i: (46 if top-i*size*1.2<38*mm else 69)*mm
  body=wrap('\n\n'.join(t['paragraphs']),size,body_width)
  while top-len(body)*size*1.2<28*mm and size>9:
   size=max(9,size-.2);body=wrap('\n\n'.join(t['paragraphs']),size,body_width)
  pos=95*mm
  for line in title:
   c.setFont('Card',11.5);c.drawString(6*mm,pos,line);pos-=14
  pos-=10
  for line in body:
   c.setFont('Card',size);c.drawString(6*mm,pos,line);pos-=size*1.2
  assert pos>=28*mm,(idx,pos/mm)
 text('Mama liebt dich, Mama liebt dich',6,25,7.5)
 text('und kämpft um dich.',6,21.5,7.5)
 c.setLineWidth(.5);c.line(80*mm,18*mm,80*mm,98*mm)
 c.drawImage(QR,55*mm,16*mm,20*mm,20*mm)
 c.rect(124*mm,76*mm,18*mm,23*mm);text('Briefmarke',126,87,6.4)
 text('An',86,67,9)
 if with_address:
  for n,line in enumerate(ADDRESS):text(line,86,59-n*4.1,9)
 else:
  for n in range(5):c.line(86*mm,(57-n*10)*mm,142*mm,(57-n*10)*mm)
 text('systemfehlerfamilie.de/postkartenaktion/',6,17,6.2)
 c.restoreState()
def cuts(c):
 c.setStrokeColorRGB(.4,.4,.4);c.setLineWidth(.25)
 for xx in [X,X+W,X+2*W]:c.line(xx,Y,xx,Y+2*H)
 for yy in [Y,Y+H,Y+2*H]:c.line(X,yy,X+2*W,yy)

def build(name,with_text,with_address):
 path=BASE/'downloads'/name
 c=canvas.Canvas(str(path),pagesize=(297*mm,210*mm),pageCompression=1,invariant=1)
 c.setTitle('Kinderrechte kennen keine Weihnachtspause - vier Postkarten auf A4')
 c.setAuthor('Systemfehler Familie')
 c.setViewerPreference('Duplex','DuplexFlipShortEdge');c.setViewerPreference('PrintScaling','None')
 for i,(motif,idx) in enumerate(CARDS):
  col,row=i%2,i//2;c.drawImage(IMAGES[motif],X+col*W,Y+(1-row)*H,W,H)
 cuts(c);c.showPage()
 for i,(_,idx) in enumerate(CARDS):
  col,row=i%2,i//2;back(c,X+(1-col)*W,Y+(1-row)*H,idx,with_text,with_address)
 cuts(c);c.showPage();c.save()
 print(name,path.stat().st_size)
for name,txt,addr in [('Vier_Postkarten_SOS_Muenchen.pdf',True,True),('Vier_Postkarten_Texte.pdf',True,False),('Vier_Postkarten_Leer.pdf',False,False)]:build(name,txt,addr)
# A single large colouring sheet, without a postcard back or cut lines.
c=canvas.Canvas(str(BASE/'downloads/Ausmalbild_A4.pdf'),pagesize=(297*mm,210*mm),pageCompression=1,invariant=1)
c.setTitle('Kinderrechte - Ausmalbild auf A4');c.setAuthor('Systemfehler Familie')
im=Image.open(BASE/'generator/assets/malen.png');iw,ih=im.size
width=277*mm;height=width*ih/iw
if height>190*mm:height=190*mm;width=height*iw/ih
c.drawImage(ImageReader(im),(297*mm-width)/2,(210*mm-height)/2,width,height)
c.showPage();c.save()
# One consistent guide for current downloads and the generator.
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
styles={
 'title':ParagraphStyle('title',fontName='Card',fontSize=21,leading=27,textColor=INK,spaceAfter=16),
 'head':ParagraphStyle('head',fontName='Card',fontSize=14,leading=19,textColor=INK,spaceBefore=15,spaceAfter=7),
 'body':ParagraphStyle('body',fontName='Card',fontSize=10.5,leading=16,spaceAfter=9),
}
flow=[]
def p(text,kind='body'):flow.append(Paragraph(text,styles[kind]))
p('Postkarten drucken','title')
p('Vier Postkarten auf einem A4-Blatt','head')
p('Die drei Vierer-PDFs enthalten jeweils zwei Seiten: vorne vier Farbmotive, hinten vier passend zugeordnete Postkartenrückseiten. Weihnachtsrot, Eisblau, Adventsfenster und Weihnachtsgrün mit fünf Jungen sind je einmal dabei. Jede Karte ist etwa 140 × 99 mm groß; die Karten liegen direkt aneinander und passen in einen C6-Umschlag.')
p('A4 quer · 100 % / Tatsächliche Größe · Duplex an der kurzen Kante. Eine PDF-Seite pro Blattseite. „An Seite anpassen“, „Mehrere Seiten pro Blatt“ und Broschürendruck ausschalten. Die PDF enthält bereits vier Karten je Seite.')
p('Die Rückseiten sind für das Wenden an der kurzen Kante angeordnet. Erst nach dem beidseitigen Druck die äußeren und mittleren Schnittlinien schneiden. Der kleine weiße Außenrand ist Druckreserve und wird entfernt.')
p('Drei fertige Varianten','head')
p('Mit Texten und SOS-Adresse: drei Mustertexte, adressiert an SOS-Kinderdorf e. V., z. Hd. Jörg Faulstich, Vorstandsvorsitzender, Renatastraße 77, 80639 München. Text 1 ist zweimal enthalten.')
p('Mit Texten, ohne Adresse: gleiche Texte, freie Adresszeilen. Leere Rückseiten: Platz für eigenen Text und Adresse. Auf jeder Rückseite bleiben die Grußzeile „Mama liebt dich, Mama liebt dich und kämpft um dich.“ und der QR-Code zur Aktion enthalten.')
p('Wenn dein Drucker nicht automatisch beidseitig druckt','head')
p('Zuerst nur PDF-Seite 1 drucken. Das Blatt nach der Anleitung deines Druckers wieder einlegen und nur PDF-Seite 2 auf die Rückseite drucken. Die richtige Einlegerichtung hängt vom Drucker ab. Vorher ein Probeblatt markieren und testen, welche Seite und welcher Rand eingezogen werden. Beide Kartenseiten müssen nach dem Ausschneiden aufrecht lesbar sein.')
p('Immer zuerst ein Probeblatt','head')
p('Auf gewöhnlichem Papier Druckränder, Ausrichtung und Versatz prüfen. Erst danach auf geeignetem festem Papier drucken. Die Papierstärke muss vom Drucker unterstützt werden. QR-Codes und ihre weißen Ränder nicht bemalen oder überkleben.')
flow.append(PageBreak())
p('Einzelkarten und Ausmalbild','title')
p('Deine persönliche Karte aus dem Generator','head')
p('Mustertext wählen, direkt im Feld bearbeiten oder „Nur eigener Text / leere Textfläche“ wählen. Für eine ganz leere Textfläche Überschrift und Text löschen und die Grußzeile abwählen. Maximal 70 Wörter und 550 Zeichen im Text, dazu 80 Zeichen für die Überschrift. Wenn der Platz trotzdem nicht reicht, bittet der Generator um Kürzung. Empfängeradresse und „Zu Händen“ lassen sich frei bearbeiten.')
p('A4 einseitig zum Zusammenkleben','head')
p('A4 hoch, 100 %, einseitig. Vorder- und Rückseite sind auf demselben Blatt. Beide Karten an den Schnittmarken ausschneiden und die unbedruckten Seiten deckungsgleich zusammenkleben. Fertigformat 148 × 105 mm.')
p('A4 automatisch doppelseitig','head')
p('A4 hoch, 100 %, Duplex an der langen Kante. Seite 1 ist die Vorderseite, Seite 2 die Rückseite. Erst nach dem beidseitigen Druck ausschneiden. Diese Wendekante gilt für die Einzelkarte, nicht für die Vierer-Bögen.')
p('A4 mit manuellem Wenden','head')
p('A4 hoch, 100 %. Zuerst Seite 1, dann auf demselben Blatt Seite 2 drucken. Einlegerichtung vorher am markierten Probeblatt prüfen. Kartenformat 148 × 105 mm.')
p('Direkt auf A6','head')
p('A6 quer, 100 %. Für das vollständige Motiv ist randloser A6-Druck erforderlich. Falls beidseitiger A6-Druck unterstützt wird, kurze Wendekante wählen und am Probeblatt prüfen.')
p('Ein großes Ausmalbild auf A4','head')
p('„Ausmalbild_A4.pdf“ enthält eine einzige A4-Querformatseite mit großem Motiv. Einseitig in Schwarz-Weiß oder Graustufen drucken, 100 %. Keine Rückseite, kein Ausschneiden und kein Zusammenkleben erforderlich. Mehrere Exemplare können mit Erlaubnis zum Mitnehmen ausgelegt werden.')
p('systemfehlerfamilie.de/postkartenaktion/')
SimpleDocTemplate(str(BASE/'downloads/Druckanleitung.pdf'),pagesize=(210*mm,297*mm),rightMargin=18*mm,leftMargin=18*mm,topMargin=16*mm,bottomMargin=16*mm,title='Postkartenaktion - Druckanleitung',author='Systemfehler Familie').build(flow)
# Do not publish author, creator, timestamps or document IDs in generated downloads.
import fitz
for name in ['Vier_Postkarten_SOS_Muenchen.pdf','Vier_Postkarten_Texte.pdf','Vier_Postkarten_Leer.pdf','Druckanleitung.pdf']:
 path=BASE/'downloads'/name
 doc=fitz.open(path);doc.set_metadata({});doc.del_xml_metadata();doc.xref_set_key(-1,'ID','null')
 data=doc.tobytes(garbage=4,deflate=True,no_new_id=True);doc.close();path.write_bytes(data)
