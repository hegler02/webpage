export const originals={
 '01':{name:'전체 설비 개요',url:new URL('./education/conveyor/original-01.webp',import.meta.url).href},
 '02':{name:'3상 동력과 모터',url:new URL('./education/conveyor/original-02.webp',import.meta.url).href},
 '03':{name:'제어 전원',url:new URL('./education/conveyor/original-03.webp',import.meta.url).href},
 '06':{name:'운전 허가·비상정지',url:new URL('./education/conveyor/original-06.webp',import.meta.url).href},
 '07':{name:'운전 선택·접촉기 코일',url:new URL('./education/conveyor/original-07.webp',import.meta.url).href},
 '09':{name:'PLC 입력과 감지기',url:new URL('./education/conveyor/original-09.webp',import.meta.url).href},
 '21':{name:'조작반 배치',url:new URL('./education/conveyor/original-21.webp',import.meta.url).href},
 '22':{name:'제어반 배치',url:new URL('./education/conveyor/original-22.webp',import.meta.url).href}
};
export function originalDrawing(n){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 760" role="img" aria-label="원본 ${n}번 DWG 미리보기"><rect width="1000" height="760" fill="white"/><image href="${originals[n].url}" x="0" y="0" width="1000" height="760" preserveAspectRatio="xMidYMid meet"/></svg>`;}
