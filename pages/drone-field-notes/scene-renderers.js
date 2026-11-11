"use strict";
window.DRONE_SCENES = (() => {
const {esc,img,stageKeys}=window.DRONE_UTILS;
const art=window.DRONE_ILLUSTRATIONS;
const {spatial,process,lightDots,survey}=window.DRONE_DIAGRAMS;
const copy=(cls="scene-copy")=>'<div class="'+cls+'"><h2 class="beat-head" id="beatHead"></h2><p class="beat-text" id="beatText"></p><p class="beat-note" id="beatNote"></p></div>';
const hero=(s)=>img(s.image,"hero-photo")+ '<div class="hero-shade"></div>'+copy('hero-copy');
const renderers={
 glossary:s=>art.glossary(s),
 mosaic:s=>'<div class="mosaic">'+s.images.map((name,i)=>'<figure class="mosaic-tile mosaic-'+name+'" data-order="'+i+'">'+img(name)+'<figcaption>'+esc(s.labels[i])+'</figcaption></figure>').join('')+'</div>'+(s.futureImages?'<div class="future-mosaic">'+s.futureImages.map((name,i)=>'<figure>'+img(name)+'<figcaption>'+esc(s.futureLabels[i])+'</figcaption></figure>').join('')+'</div>':'')+copy('scene-band'),
 quadrants:s=>'<div class="quad-grid">'+s.items.map((x,i)=>'<article class="quad" data-order="'+i+'">'+img(x[2])+'<div><h2>'+esc(x[0])+'</h2><p>'+esc(x[1])+'</p></div></article>').join('')+'</div>'+copy('scene-band'),
 system:s=>art.equipment(s,copy),
 process:s=>s.id==='reliability'?art.reliability(s,copy):process(s),
 dock:s=>art.dock(s,copy),
 ecology:s=>art.ecology(s,copy),
 cinema:s=>hero(s)+art.poster(s)+'<div class="hero-stat"><strong>'+esc(s.metric)+'</strong><span>'+esc(s.unit)+'</span><p>'+esc(s.metricNote)+'</p></div>',
 hero:s=>s.officialPoster?art.official(s,copy):s.id==='fishing'?art.fishing(s,copy):hero(s),
 inspection:s=>art.inspection(s,copy),
 'metric-hero':s=>hero(s)+'<div class="hero-stat"><strong>'+esc(s.metric)+'</strong><span>'+esc(s.unit)+'</span><p>'+esc(s.metricNote)+'</p></div>',
 airtaxi:s=>art.aircraft(s,copy),
 mapping:s=>spatial(s,true),
 spatial:s=>spatial(s),
 survey:s=>copy()+'<div class="survey-visual">'+survey()+'</div>',
 compare:s=>'<div class="compare-frame">'+img(s.images[0],'compare-before')+img(s.images[1],'compare-after')+'<div class="compare-divider"></div><div class="compare-focus" aria-hidden="true"></div><span class="compare-tag before-tag">지난 촬영</span><span class="compare-tag after-tag">이번 촬영</span></div>'+copy('scene-band'),
 dual:s=>art.agriculture(s,copy),
 dots:s=>'<div class="dots-visual">'+lightDots()+'</div>'+copy(),
 metrics:s=>img(s.image,'hero-photo')+'<div class="hero-shade"></div><div class="large-metrics">'+s.metrics.map(([v,u])=>'<div><strong>'+esc(v)+'</strong><span>'+esc(u)+'</span></div>').join('')+'<p>'+esc(s.metricNote)+'</p></div>'+copy('scene-band'),
 medical:s=>window.DRONE_CASE_SCENES.medical(s,copy),
 documents:s=>window.DRONE_CASE_SCENES.documents(s,copy),
 matrix:s=>'<div class="status-matrix">'+s.columns.map((c,i)=>'<article class="status-column status-'+i+'"><p>'+esc(c[1])+'</p><h2>'+esc(c[0])+'</h2><ul>'+c[2].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></article>').join('')+'</div>'+copy('scene-band'),
 questions:s=>'<div class="question-stack">'+s.beats.map((b,i)=>'<article class="question-row" data-order="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span><div><h2>'+esc(b.headline)+'</h2><p>'+esc(b.text)+'</p></div></article>').join('')+'</div><p class="question-note" id="beatNote"></p>',
 workshop:s=>'<div class="workshop-grid">'+s.images.map((name,i)=>'<figure>'+img(name)+'<figcaption>'+esc(s.labels[i])+'</figcaption></figure>').join('')+'</div>'+copy('scene-band')
};
function ruler(s,data){
 if(s.layout==='glossary')return '';
 const keys=stageKeys(s,data);
 const cells=data.stageScale.map(x=>{const on=keys.includes(x.key);return '<li class="stage-cell stage-'+x.key+(on?' is-on':'')+'"><span>'+esc(x.label)+'</span>'+(on?'<span class="sr-only"> 해당</span>':'')+'</li>';}).join('');
 return '<div class="stage-ruler">'+(keys.length?'':'<p class="stage-ruler-caption">'+esc(s.status.label)+'</p>')+'<ol aria-label="활용 단계">'+cells+'</ol></div>';
}
function mount(root,s,{preserveSpatial=false}={}){
 const data=window.DRONE_CONTENT;
 const retained=preserveSpatial?root.querySelector('.spatial-world'):null;
 if(!renderers[s.layout])throw new Error('Unknown scene layout: '+s.layout);
 const body=renderers[s.layout](s);
 root.innerHTML='<section class="slide layout-'+s.layout+' slide-'+s.id+'" data-a11y-view data-a11y-active="true" tabindex="-1" aria-labelledby="slideTitle"><p class="eyebrow">'+esc(s.kicker)+'</p>'+ruler(s,data)+'<h1 id="slideTitle">'+esc(s.title)+'</h1>'+body+window.DRONE_SOLO.render(s)+'<footer class="slide-footer"><span class="footer-source">근거 '+s.sourceIds.length+'건 · '+esc(s.sourceLabel)+'</span>'+(s===data.slides[0]?'<span class="footer-disclosure">'+esc(data.imagePolicy)+'</span>':'')+'<span class="slide-number">'+s.number+' / '+data.slides.length+'</span></footer></section>';
 if(retained)root.querySelector('.spatial-world').replaceWith(retained);
}
return {mount,layouts:Object.keys(renderers)};
})();
