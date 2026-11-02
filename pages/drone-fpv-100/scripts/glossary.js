export function initGlossary(){
 const input=document.querySelector('#gq'),terms=[...document.querySelectorAll('.g-term')],groups=[...document.querySelectorAll('[data-group]')],empty=document.querySelector('.doc-empty');
 document.querySelector('.doc-search').addEventListener('submit',event=>event.preventDefault());
 input.addEventListener('input',()=>{
  const words=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  terms.forEach(term=>{term.hidden=!words.every(word=>term.dataset.search.includes(word));});
  groups.forEach(group=>{group.hidden=![...group.querySelectorAll('.g-term')].some(term=>!term.hidden);});
  empty.hidden=groups.some(group=>!group.hidden);
 });
}
