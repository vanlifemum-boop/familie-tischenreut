"""Render exact informational diagrams as editable SVG from reviewed text.
Run with a Python interpreter that has Pillow. Raster export uses sharp separately.
"""
from pathlib import Path
from html import escape
import json
from PIL import ImageFont
ROOT=Path(__file__).resolve().parents[1]
FONT=Path('/usr/share/fonts/truetype/dejavu')
REG=FONT/'DejaVuSans.ttf';BOLD=FONT/'DejaVuSans-Bold.ttf'
def font(size,bold=False):return ImageFont.truetype(str(BOLD if bold else REG),size)
def wrap(text,size,width,bold=False):
 f=font(size,bold);lines=[];line=''
 for word in text.split():
  test=(line+' '+word).strip()
  if f.getlength(test)>width and line:lines.append(line);line=word
  else:line=test
 if line:lines.append(line)
 assert all(f.getlength(x)<=width+1 for x in lines),(text,size,width)
 return lines

def render(m,d):
 elements=[];y=62
 def text(lines,x,size,line_height,color='#142943',bold=False):
  nonlocal y
  for line in lines:
   elements.append(f'<text x="{x}" y="{y}" font-family="DejaVu Sans" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(line)}</text>');y+=line_height
 text([f'§§ ERKLÄRT  ·  THEMA {m["nr"]:02d} / 70'],72,25,34,'#8a590e',True);y+=28
 text(wrap(m['norm'],47,1056,True),72,47,58,bold=True);y+=10
 text(wrap(m['titel'],34,1056,True),72,34,44,bold=True);y+=25
 elements.append(f'<line x1="72" x2="1128" y1="{y}" y2="{y}" stroke="#ccd7e5" stroke-width="2"/>');y+=48
 text(['DEINE SITUATION'],72,22,32,'#316b99',True);y+=4
 text(wrap(d['situation'],28,1056),72,28,38);y+=26
 text(['MÖGLICHE NÄCHSTE SCHRITTE'],72,22,34,'#316b99',True);y+=9
 boxes=[]
 assert len(d['steps'])==5,(m['nr'],'five steps required')
 for i,step in enumerate(d['steps'],1):
  lines=wrap(step,30,898,True);assert len(lines)<=3,(m['nr'],step)
  top=y;h=max(112,len(lines)*40+36)
  elements.append(f'<rect x="72" y="{top}" width="1056" height="{h}" rx="15" fill="#e8eef5" stroke="#cbd8e6" stroke-width="2"/>')
  cy=top+h/2;elements.append(f'<circle cx="122" cy="{cy}" r="30" fill="#142943"/><text x="122" y="{cy+11}" text-anchor="middle" font-family="DejaVu Sans" font-size="30" font-weight="700" fill="white">{i}</text>')
  y=top+(h-len(lines)*40)/2+30;text(lines,182,30,40,bold=True)
  boxes.append({'number':i,'top':top,'height':h,'lines':len(lines)})
  y=top+h+15
 y+=18;limit=wrap(d['limit'],26,1008);h=len(limit)*36+75;top=y
 elements.append(f'<rect x="72" y="{top}" width="1056" height="{h}" rx="14" fill="#f7eddb"/>');y=top+33
 text(['WICHTIGE GRENZE'],96,20,32,'#715017',True);text(limit,96,26,36,'#402f18');y=top+h+43
 height=max(1500,int(y+95));y=height-71
 text(['systemfehlerfamilie.de  ·  Redaktionell geprüft: 26.10.2026'],72,21,30,'#56687a')
 text(['Vereinfachte Orientierung. Voraussetzungen und Quellen im Artikel lesen.'],72,20,28,'#56687a')
 title=m['norm']+': '+m['titel'];desc=d['situation']+' '+'; '.join(d['steps'])+'. '+d['limit']
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><rect width="1200" height="{height}" fill="#f5f7fa"/><rect width="1200" height="16" fill="#bc8a22"/>'+''.join(elements)+'</svg>'
 (ROOT/m['svg']).write_text(svg)
 return height,boxes

def main():
 p=ROOT/'rechte-fuer-eltern/manifest.json';manifest=json.loads(p.read_text());report=json.loads((ROOT/'redaktion/paket70-rechtspruefung.json').read_text());review={x['nr']:x for x in report['articles']};layout=[]
 for m in manifest:
  height,boxes=render(m,review[m['nr']]['diagram']);m['image_height']=height;layout.append({'nr':m['nr'],'height':height,'boxes':boxes})
 p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');(ROOT/'redaktion/paket70-diagrammlayout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n')
 print('70 SVG diagrams created; text wrapping and box bounds checked')
if __name__=='__main__':main()
