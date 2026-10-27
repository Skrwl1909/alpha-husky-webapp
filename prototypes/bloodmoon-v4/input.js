export function bindInput(canvas, send) {
  let pointer = null, anchor = null;
  const point = e => { const r = canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*360/r.width,y:(e.clientY-r.top)*540/r.height}; };
  function reset() {
    if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
    pointer = null; anchor = null; send(0,0);
  }
  function move(e) {
    if (e.pointerId !== pointer) return;
    const p = point(e), dx = p.x-anchor.x, dy = p.y-anchor.y, d = Math.hypot(dx,dy);
    send(d < 5 ? 0 : dx/Math.max(38,d),d < 5 ? 0 : dy/Math.max(38,d));
  }
  canvas.addEventListener('pointerdown',e => {
    if (pointer !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pointer = e.pointerId; anchor = point(e); canvas.setPointerCapture(pointer); move(e);
  });
  canvas.addEventListener('pointermove',move);
  for (const name of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(name,e => {if(e.pointerId === pointer) reset();});
  window.addEventListener('blur',reset); window.addEventListener('resize',reset);
  document.addEventListener('visibilitychange',() => { if (document.hidden) reset(); });
  return {reset, get anchor(){return anchor;}};
}
