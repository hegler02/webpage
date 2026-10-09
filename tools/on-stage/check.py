"""Keep this personal film's playback, identity and discovery paths coherent."""
from pathlib import Path
import json,sys,wave
ROOT=Path(__file__).resolve().parents[2]
FILM=ROOT/'pages/on-stage'
PROFILE=ROOT/'pages/profile'
sys.path.insert(0,str(ROOT/'tools/discovery'))
from validate_discovery import validate_discovery
errors=validate_discovery(FILM,media_manifest=FILM/'media.assets.json')
assert not errors, '\n'.join(errors)
url='https://mirinaeman.com/pages/on-stage/'
catalog=json.loads((PROFILE/'data/message-bodies.json').read_text(encoding='utf-8'))
work=next(w for w in catalog['bodies'] if w['body_id']=='on-stage')
assert work['canonical_url']==url
creator=json.loads((PROFILE/'data/creator-profile.json').read_text(encoding='utf-8'))
assert creator['featured_film']['url']==url
profile=(PROFILE/'profile/index.html').read_text(encoding='utf-8')
assert profile.count('class="creator-film-card"')==1
assert profile.index('CREATOR_CONTACT_END') < profile.index('CREATOR_FILM_START')
with wave.open(str(FILM/'media/score.wav')) as audio:
    assert audio.getnframes()/audio.getframerate()==48
for i in range(1,6): assert (FILM/f'media/portrait-{i}.jpg').is_file()
html=(FILM/'index.html').read_text(encoding='utf-8')
assert 'autoplay' not in html and '시안' not in html
assert '/archive/image-cinema/' in html and '/constellation/?node=work%3Aon-stage' in html
graph=json.loads((PROFILE/'constellation/graph.json').read_text(encoding='utf-8'))
assert any(n['id']=='work:on-stage' for n in graph['nodes'])
print('On Stage: PASS (48s audio, assets, profile, catalog, constellation and discovery)')
