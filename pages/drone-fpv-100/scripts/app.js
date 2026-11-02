import {initCatalogue} from './catalogue.js?v=7d1c3f929615';
import {initLesson} from './lesson.js?v=7d1c3f929615';
import {initGlossary} from './glossary.js?v=7d1c3f929615';
document.documentElement.classList.add('interactive');
if(document.body.dataset.mode==='catalogue')initCatalogue();
if(document.body.dataset.mode==='lesson')initLesson();
if(document.body.dataset.mode==='glossary')initGlossary();
