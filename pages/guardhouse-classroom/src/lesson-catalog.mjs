// Counts and destinations are derived from the sample's registered objects.
export function registeredIds(rows, values = []) {
  const allowed = new Set(rows.map(row => row.id));
  return [...new Set(Array.isArray(values) ? values : [])].filter(id => allowed.has(id));
}

export function lessonSummary(project, completed = []) {
  const steps = project.steps ?? [];
  return {
    rooms: project.rooms.length,
    bedrooms: project.rooms.filter(room => room.use === 'bedroom').length,
    drawings: project.sheets.length,
    circuits: project.circuits.length,
    steps: steps.length,
    completed: registeredIds(steps, completed).length
  };
}

export function electricalSheet(project, device) {
  if (!device) return null;
  const role = device.kind === 'panel' ? 'circuit'
    : ['light', 'switch'].includes(device.kind) ? 'lighting' : 'power';
  return project.sheets.find(sheet => sheet.menu === 'electrical' && sheet.view === role)?.id ?? null;
}

export function targetDestination(project, target, requestedSheet) {
  if (!target) return null;
  const requested = project.sheets.find(sheet => sheet.id === requestedSheet);
  const electric = target.circuit || target.kind === 'panel';
  let sheet = requested;
  // A circuit diagram is a deliberate alternative to a physical placement plan.
  if (electric && (!sheet || sheet.menu !== 'electrical' || sheet.view !== 'circuit')) {
    sheet = project.sheets.find(row => row.id === electricalSheet(project, target));
  }
  if (!sheet) sheet = project.sheets.find(row => row.menu === (target.system === 'fire' ? 'fire' : 'building'));
  return sheet ? {menu: sheet.menu, sheet: sheet.id, element: target.id} : null;
}
