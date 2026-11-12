// Same name card as the main page: the record and the making-of are one text under two labels.
const root=document.documentElement;
document.getElementById('flip').addEventListener('click',()=>{root.dataset.label=root.dataset.label==='gancheop'?'spy':'gancheop';});
if(location.hash==='#spy')root.dataset.label='spy';
