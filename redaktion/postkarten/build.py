#!/usr/bin/env python3
"""Build the postcard and exact QR assets. Run from the repository root."""
from pathlib import Path
from io import BytesIO
import argparse
import qrcode
from qrcode.image.svg import SvgPathFillImage
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

URL = 'https://systemfehlerfamilie.de/postkartenaktion/'
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'postkartenaktion/downloads'
TEAL = HexColor('#07514d')
INK = HexColor('#14202e')
RED = HexColor('#9d332e')

def paragraph(c, text, x, top, width, size=9, bold=False, color=INK):
    style = ParagraphStyle('copy', fontName='DejaVu-Bold' if bold else 'DejaVu',
                           fontSize=size, leading=size*1.4, textColor=color)
    p = Paragraph(text, style)
    _, height = p.wrap(width*mm, 100*mm)
    p.drawOn(c, x*mm, top*mm-height)

def qr_on_pdf(c, matrix, x, y, size):
    cell = size*mm/len(matrix)
    c.setFillColorRGB(1,1,1)
    c.rect(x*mm,y*mm,size*mm,size*mm,fill=1,stroke=0)
    c.setFillColorRGB(0,0,0)
    for row, cells in enumerate(matrix):
        for col, black in enumerate(cells):
            if black:
                c.rect(x*mm+col*cell, y*mm+(len(matrix)-1-row)*cell,
                       cell,cell,fill=1,stroke=0)
    c.linkURL(URL, (x*mm,y*mm,(x+size)*mm,(y+size)*mm), relative=0)

def build(source):
    OUT.mkdir(parents=True,exist_ok=True)
    image = Image.open(source).convert('RGBA')
    image.save(OUT/'aktionslogo-weihnachtspause.webp', 'WEBP', quality=94, method=6)
    # Encoding and decoding are deterministic; the image generator does not draw the code.
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=20,border=4)
    qr.add_data(URL)
    qr.make(fit=True)
    qr.make_image(fill_color='black',back_color='white').save(OUT/'qr-postkartenaktion.png')
    qr.make_image(image_factory=SvgPathFillImage).save(OUT/'qr-postkartenaktion.svg')
    matrix=qr.get_matrix()
    for suffix,file in [('', 'DejaVuSans.ttf'),('-Bold','DejaVuSans-Bold.ttf')]:
        pdfmetrics.registerFont(TTFont('DejaVu'+suffix, '/usr/share/fonts/truetype/dejavu/'+file))

    # A white JPEG backing reduces the printable PDF size; the original logo stays transparent.
    printable=Image.new('RGB',image.size,'white')
    printable.paste(image,mask=image.getchannel('A'))
    jpg=BytesIO()
    printable.save(jpg,format='JPEG',quality=95)
    jpg.seek(0)
    c=canvas.Canvas(str(OUT/'postkarte-weihnachtspause-a6.pdf'),pagesize=(148*mm,105*mm))
    c.setTitle('Kinderrechte kennen keine Weihnachtspause - Postkarte DIN A6')
    c.setAuthor('Systemfehler Familie')
    c.setSubject('Postkartenaktion - Jedes Kind hat Rechte. Jeden Tag.')
    c.drawImage(ImageReader(jpg),5*mm,8*mm,89*mm,89*mm)
    c.setStrokeColor(RED)
    c.setLineWidth(1.5)
    c.line(101*mm,90*mm,140*mm,90*mm)
    paragraph(c,'Jedes Kind<br/>hat Rechte.<br/>Jeden Tag.',101,85,41,12,True,TEAL)
    paragraph(c,'Auch an Weihnachten.',101,62,40,8)
    qr_on_pdf(c,matrix,101,18,33)
    paragraph(c,'Zur Postkartenaktion',101,16,41,6.6,True,TEAL)
    paragraph(c,'systemfehlerfamilie.de/<br/>postkartenaktion/',101,11,42,6.2)
    c.showPage()
    paragraph(c,'Kinderrechte kennen<br/>keine Weihnachtspause.',7,97,63,10,True,TEAL)
    paragraph(c,'Kinder müssen gehört werden. Ihre Wünsche, Bindungen und Rechte verdienen jeden Tag Aufmerksamkeit. Auch an Weihnachten.',7,82,62,8.2)
    paragraph(c,'Meine Nachricht:',7,57,62,7.5,True)
    c.setStrokeColor(HexColor('#b8c3c9'))
    c.setLineWidth(.45)
    for y in [45,36,27]: c.line((7 if y==45 else 30)*mm,y*mm,69*mm,y*mm)
    qr_on_pdf(c,matrix,7,16,20)
    c.line(77*mm,15*mm,77*mm,97*mm)
    c.rect(124*mm,77*mm,17*mm,21*mm,stroke=1,fill=0)
    paragraph(c,'Bitte<br/>frankieren',126,91,14,6.2)
    paragraph(c,'An',84,68,55,8,True)
    for y in [57,46,35,24]: c.line(84*mm,y*mm,141*mm,y*mm)
    paragraph(c,'Systemfehler Familie<br/>systemfehlerfamilie.de/postkartenaktion/',30,23,45,6)
    c.linkURL(URL,(30*mm,15.5*mm,75*mm,23*mm),relative=0)
    c.save()

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--logo',required=True,type=Path,help='Approved or user-requested generated logo image')
    build(p.parse_args().logo)
