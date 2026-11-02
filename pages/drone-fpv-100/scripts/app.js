import {initCatalogue} from './catalogue.js?v=a307d3b9f2f3';
import {initLesson} from './lesson.js?v=a307d3b9f2f3';
document.documentElement.classList.add('interactive');
if(document.body.dataset.mode==='catalogue')initCatalogue();
if(document.body.dataset.mode==='lesson')initLesson();
