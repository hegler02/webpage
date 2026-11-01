(() => {
  const button=document.getElementById('theme');
  const set=light=>{document.documentElement.dataset.theme=light?'light':'dark';button.textContent=light?'어둡게 보기':'밝게 보기';button.setAttribute('aria-pressed',String(light));};
  try{set(localStorage.getItem('seoul-theme')==='light');}catch{set(false);}
  button.addEventListener('click',()=>{const light=document.documentElement.dataset.theme!=='light';set(light);try{localStorage.setItem('seoul-theme',light?'light':'dark');}catch{}});
})();
