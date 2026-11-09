(() => {
  const root = document.documentElement;
  const media = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'luna-cursor-enabled-v1';
  let enabled = true;
  try { enabled = localStorage.getItem(key) !== 'false'; } catch {}
  const layer = document.createElement('div');
  layer.className = 'luna-cursor-layer';
  layer.setAttribute('popover', 'manual');
  layer.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('div');
  ring.className = 'luna-cursor-ring';
  layer.append(ring);
  document.body.append(layer);
  let x=0, y=0, rx=0, ry=0, frame=0, active=false;
  function raiseLayer() {
    // Manual popovers share the browser top layer with dialogs. Reopen above them.
    if (typeof layer.showPopover === 'function') {
      try {
        if (layer.matches(':popover-open')) layer.hidePopover();
        layer.showPopover();
        return;
      } catch {}
    }
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    (dialogs.at(-1) || document.body).append(layer);
  }
  function animate() {
    const ease = reduced.matches ? 1 : .19;
    rx += (x-rx)*ease; ry += (y-ry)*ease;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    frame = active && (Math.abs(x-rx)>.08 || Math.abs(y-ry)>.08) ? requestAnimationFrame(animate) : 0;
  }
  function hide() {
    active=false;
    layer.classList.remove('visible','hover','down');
    if(frame) cancelAnimationFrame(frame);
    frame=0;
  }
  function sync() {
    root.classList.toggle('cursor-enabled', enabled && media.matches);
    if(!enabled || !media.matches) hide();
    document.querySelectorAll('.cursor-toggle').forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      button.title = enabled ? 'Desativar efeito do cursor' : 'Ativar efeito do cursor';
    });
  }
  new MutationObserver(raiseLayer).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('pointermove', event => {
    if(!enabled || !media.matches || event.pointerType==='touch') return;
    if(event.target.closest('input,textarea,[contenteditable=true],[data-cursor=off]')) { hide(); return; }
    x=event.clientX; y=event.clientY;
    if(!active) { rx=x; ry=y; }
    active=true;
    layer.classList.add('visible');
    layer.classList.toggle('hover',!!event.target.closest('a,button,summary,[role=button]'));
    if(!frame) frame=requestAnimationFrame(animate);
  },{passive:true});
  document.addEventListener('pointerdown',()=>{if(active)layer.classList.add('down')},{passive:true});
  document.addEventListener('pointerup',()=>layer.classList.remove('down'),{passive:true});
  root.addEventListener('pointerleave',hide);
  document.addEventListener('keydown',hide);
  window.addEventListener('blur',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
  media.addEventListener('change',sync);
  document.querySelectorAll('.cursor-toggle').forEach(button => button.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(key, String(enabled)); } catch {}
    sync();
  }));
  raiseLayer();
  sync();
})();
