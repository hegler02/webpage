import {initCatalogue} from './catalogue.js?v=48a7782c1e25';
import {initLesson} from './lesson.js?v=48a7782c1e25';
import {initGlossary} from './glossary.js?v=48a7782c1e25';
document.documentElement.classList.add('interactive');
if(document.body.dataset.mode==='catalogue')initCatalogue();
if(document.body.dataset.mode==='lesson')initLesson();
if(document.body.dataset.mode==='glossary')initGlossary();
