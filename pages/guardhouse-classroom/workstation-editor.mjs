import {fitsSupport} from './src/teaching-equipment.mjs';

export function workstationEditor(host, device, state, electric, actions) {
  const {id, support, pos, circuit, socket} = device;
  const [x,y,right,back] = support;
  const halfX = device.size[0]/2, halfY = device.size[1]/2;
  const field = (label,key,value,lo,hi) =>
    '<label>'+label+'<input name="'+key+'" type="number" required step=".01" min="'+lo.toFixed(2)+'" max="'+hi.toFixed(2)+'" value="'+value.toFixed(2)+'"></label>';
  const load = electric.circuits.find(c => c.id === circuit);
  const switched = state.switches[id] !== false;
  host.innerHTML = '<h2>'+device.name+'</h2><p>'+socket+' 콘센트에 꽂은 작업등입니다. 수납장 위에서 위치를 옮기거나 입력전력을 바꿔 보세요.</p>'+
    '<p><strong>'+circuit+' 회로 합계 '+load.watts+' W</strong> · 작업등 '+(device.on?'점등':'소등')+'</p>'+
    '<form><label>작업등 입력전력 (W)<input type="number" name="watts" required min="1" max="3000" step="1" value="'+device.watts+'"></label>'+
    '<div class="form-row">'+field('가로 위치 (m)','x',pos[0],x+halfX,right-halfX)+field('세로 위치 (m)','y',pos[1],y+halfY,back-halfY)+'</div>'+
    '<div class="button-row"><button type="submit" class="primary">설계에 적용</button></div></form>'+
    '<div class="button-row"><button data-action="switch">작업등 스위치 '+(switched?'끄기':'켜기')+'</button><button data-action="calc">이 회로 계산</button><button data-action="term">회로 뜻</button></div>';
  host.querySelector('form').onsubmit = event => {
    event.preventDefault();
    const form = event.currentTarget.elements;
    const xy = [form.x.valueAsNumber, form.y.valueAsNumber];
    if (!fitsSupport(device,xy) || !event.currentTarget.reportValidity()) return;
    state.positions[id] = xy;
    state.watts[id] = form.watts.valueAsNumber;
    actions.apply();
  };
  host.querySelector('[data-action="switch"]').onclick = () => actions.toggle(id);
  host.querySelector('[data-action="calc"]').onclick = () => actions.calc(circuit);
  host.querySelector('[data-action="term"]').onclick = actions.term;
}
