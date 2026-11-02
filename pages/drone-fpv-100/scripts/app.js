import {initCatalogue} from './catalogue.js?v=930d8f9c53e5';
import {initLesson} from './lesson.js?v=930d8f9c53e5';
document.documentElement.classList.add('interactive');
if(document.body.dataset.mode==='catalogue')initCatalogue();
if(document.body.dataset.mode==='lesson')initLesson();
