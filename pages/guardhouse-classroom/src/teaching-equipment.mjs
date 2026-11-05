// Drawing coordinates use metres. The centre of a lamp is measured from the structural floor.
export function boxElement(id, name, bounds, base, height, kind, group, color) {
  const [x, y, right, back] = bounds;
  return {id, name, base, height, kind, group, color, educationAdded:true,
    footprint:[[x,y], [right,y], [right,back], [x,back]]};
}

export function registerWorkstation(sample, {cabinetId, lampId, bounds, outletId}) {
  const outlet = sample.devices.find(d => d.id === outletId);
  const watts = 12;
  if (!outlet || outlet.kind !== 'socket' || outlet.watts <= watts) throw Error('작업등 전원 배정을 확인하세요.');
  const [x, y, right, back] = bounds;
  const height = .76;
  const top = sample.finishLevel + height;
  const cabinet = boxElement(cabinetId, '작업용 수납장', bounds, sample.finishLevel, height, 'furniture', 'fixtures', 0xb88d60);
  cabinet.drawerFronts = true;
  const lamp = {id:lampId, name:'수납장 위 작업등', kind:'task-light', size:[.20,.18,.36],
    pos:[(x+right)/2, (y+back)/2, top+.18], support:bounds, socket:outlet.id,
    room:outlet.room, circuit:outlet.circuit, switch:lampId, watts};
  outlet.name += ' · 기타 기기';
  outlet.watts -= watts;
  sample.devices.push(lamp);
  return cabinet;
}

export function attachCords(devices) {
  for (const lamp of devices.filter(d => d.socket)) {
    const outlet = devices.find(d => d.id === lamp.socket);
    const [x,y,z] = lamp.pos;
    const side = lamp.support[2]+.018;
    const top = z-lamp.size[2]/2+.007;
    lamp.cord = [[x+.06,y,top],[side,y,top],[side,y,outlet.pos[2]],[side,outlet.pos[1],outlet.pos[2]],[...outlet.pos]];
  }
  return devices;
}

export function restoreOutletAllowance(state,raw,lamp) {
  const watts = raw.watts?.[lamp.socket];
  if (raw.equipmentVersion === 1 || !Number.isFinite(watts) || !(lamp.socket in state.watts)) return;
  const allocated = Math.min(watts,lamp.watts);
  state.watts[lamp.id] = allocated;
  state.watts[lamp.socket] = watts-allocated;
}

export function fitsSupport(device, xy) {
  if (!Array.isArray(xy) || xy.length !== 2 || !xy.every(Number.isFinite)) return false;
  const [x, y, right, back] = device.support;
  const epsilon = 1e-8;
  return xy[0] >= x + device.size[0]/2-epsilon && xy[0] <= right - device.size[0]/2+epsilon &&
    xy[1] >= y + device.size[1]/2-epsilon && xy[1] <= back - device.size[1]/2+epsilon;
}

export function circuitDemand(devices, circuit, voltage) {
  const loads = devices.filter(d => d.circuit === circuit.id && d.watts > 0);
  const watts = loads.reduce((sum, d) => sum + d.watts, 0);
  return {loads, watts, current:watts / (voltage * circuit.pf)};
}
