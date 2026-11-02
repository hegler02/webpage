import {initCatalogue} from './catalogue.js?v=837e5c331867';
import {initLesson} from './lesson.js?v=837e5c331867';
import {initGlossary} from './glossary.js?v=837e5c331867';
document.documentElement.classList.add('interactive');
if(document.body.dataset.mode==='catalogue')initCatalogue();
if(document.body.dataset.mode==='lesson')initLesson();
if(document.body.dataset.mode==='glossary')initGlossary();
