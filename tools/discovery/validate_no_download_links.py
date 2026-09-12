#!/usr/bin/env python3
"""Reject file-download UI in McLuhan viewing pages; playback sources remain valid."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

FILE_SUFFIXES = frozenset('.mp3 .wav .m4a .aac .ogg .flac .mp4 .webm .mov .mkv .vtt .srt .ass .lrc .txt .pdf .zip .png .jpg .jpeg .webp .avif'.split())
ACTION = re.compile(r'다운로드|내려\s*받기|(?:원곡|음원|영상|가사|자막|파일)\s*(?:받기|저장|열기)|\bdownload\b', re.I)
SCRIPT_RULES = (
 ('download property', re.compile(r'\.download\s*=|\[\s*[\"\']download[\"\']\s*\]\s*=')),
 ('download attribute', re.compile(r'setAttribute\s*\(\s*[\"\']download[\"\']', re.I)),
 ('file saver', re.compile(r'\b(?:saveAs|showSaveFilePicker)\s*\(')),
 ('dynamic media link', re.compile(r'\.href\s*=\s*[^;\n]*(?:\.src\b|\b(?:media|tracks|captions|lyrics)\b)',re.I)),
)

def file_target(value):
    decoded=unquote(value.strip())
    if decoded.startswith(('blob:','data:')):return True
    try:path=urlsplit(decoded).path.lower()
    except ValueError:return True
    return Path(path).suffix in FILE_SUFFIXES or bool(re.search(r'(?:^|/)(?:download|downloads)(?:/|$)',path))

class Page(HTMLParser):
    def __init__(self,label):
        super().__init__(convert_charrefs=True);self.label=label;self.errors=[];self.actions=[];self.scripts=[];self.in_script=False;self.script=[]
    def fail(self,reason):self.errors.append(f'{self.label}:{self.getpos()[0]}: {reason}')
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'download' in a:self.fail('download attribute is forbidden')
        if tag in ('a','area') and file_target(a.get('href','')):self.fail('direct media/file link is forbidden')
        if tag=='form' and file_target(a.get('action','')):self.fail('file download form is forbidden')
        if tag in ('audio','video') and 'nodownload' not in a.get('controlslist','').lower().split():self.fail('native media must declare controlslist="nodownload"')
        if tag in ('a','button','summary'):
            self.actions.append({'tag':tag,'text':a.get('aria-label','')+' '+a.get('title','')})
        for name,value in attrs:
            if name.startswith('on') and value:self.errors.extend(check_script(value,self.label))
        if tag=='script' and a.get('type','').lower() not in ('application/json','application/ld+json'):
            self.in_script=True;self.script=[]
    def handle_data(self,text):
        for a in self.actions:a['text']+=text
        if self.in_script:self.script.append(text)
    def handle_endtag(self,tag):
        if self.actions and self.actions[-1]['tag']==tag:
            a=self.actions.pop()
            if ACTION.search(a['text']):self.fail('download action label is forbidden')
        if tag=='script' and self.in_script:
            self.scripts.append(''.join(self.script));self.in_script=False

def check_script(text,label):
    errors=[f'{label}: {name} is forbidden' for name,rule in SCRIPT_RULES if rule.search(text)]
    # Literal media navigation is prohibited; assigning a playable media src is allowed.
    for match in re.finditer(r'(?:\.href\s*=|\b(?:open|assign|replace)\s*\()\s*[\"\']([^\"\']+)',text):
        if file_target(match.group(1)):errors.append(f'{label}: script navigates to a media/file URL')
    return errors

def validate_site(root):
    root=Path(root);errors=[]
    for p in sorted(root.rglob('*.html')):
        parser=Page(str(p.relative_to(root)));parser.feed(p.read_text(encoding='utf-8'));errors.extend(parser.errors)
        for s in parser.scripts:errors.extend(check_script(s,str(p.relative_to(root))))
    for p in sorted(root.rglob('*.js')):errors.extend(check_script(p.read_text(encoding='utf-8'),str(p.relative_to(root))))
    return errors

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('site',type=Path);a=ap.parse_args();errors=validate_site(a.site)
    for e in errors:print('BLOCK: '+e)
    if not errors:print('No download links: PASS (static HTML/JS; not copy protection)')
    return bool(errors)
if __name__=='__main__':raise SystemExit(main())
