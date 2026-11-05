// One command per control, scoped to the owning lesson surfaces.
export function actionFor(control, actions) {
  const matches = Object.keys(control.dataset ?? {}).filter(key => Object.hasOwn(actions, key));
  if (control.id && Object.hasOwn(actions, '#' + control.id)) matches.push('#' + control.id);
  if (matches.length > 1) throw new Error('한 컨트롤에 동작이 중복되었습니다: ' + matches.join(', '));
  return matches[0] ?? null;
}

export function bindActions(roots, actions, onError) {
  const pending = new WeakSet();
  const listeners = roots.filter(Boolean).map(root => {
    const listener = async event => {
      const control = event.target.closest?.('button,[data-object],[data-device],[data-layer]');
      if (!control || !root.contains(control) || control.disabled || pending.has(control)) return;
      try {
        const action = actionFor(control, actions);
        if (!action) return;
        pending.add(control);
        await actions[action](control, event);
      } catch (error) {
        onError(error);
      } finally {
        pending.delete(control);
      }
    };
    root.addEventListener('click', listener);
    return () => root.removeEventListener('click', listener);
  });
  return () => listeners.forEach(remove => remove());
}
