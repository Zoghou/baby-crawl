/* Touch controls — an on-screen joystick and Mom button for phones.
 *
 * The games read input from window keydown/keyup and nothing else, so this
 * layer just synthesizes those events. No game logic has to know it exists.
 *
 * Enabled when: the device reports a coarse pointer, or the landing page
 * stored a preference, or ?touch=1 is in the URL (?touch=0 forces off). */
(function () {
  const KEY = 'babycrawl:touch';
  const param = new URLSearchParams(location.search).get('touch');
  const stored = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();

  const wanted = param !== null ? param !== '0' && param !== 'off'
               : stored !== null ? stored === 'on'
               : matchMedia('(pointer: coarse)').matches;
  if (!wanted) return;

  /* ---------- synthetic key dispatch ---------- */
  const held = new Set();
  const send = (type, key) =>
    dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));

  function setHeld(next) {
    for (const k of held) if (!next.has(k)) { send('keyup', k); held.delete(k); }
    for (const k of next) if (!held.has(k)) { send('keydown', k); held.add(k); }
  }
  const releaseAll = () => setHeld(new Set());

  /* ---------- UI ---------- */
  const style = document.createElement('style');
  style.textContent = `
    .tc-layer {
      position: fixed; inset: auto 0 0 0; height: 0;
      z-index: 9999; pointer-events: none;
      opacity: 1; transition: opacity .25s;
      -webkit-user-select: none; user-select: none;
    }
    .tc-layer.tc-idle { opacity: .25; }
    .tc-stick, .tc-mom {
      position: fixed; bottom: max(22px, env(safe-area-inset-bottom, 0px) + 12px);
      pointer-events: auto; touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }
    .tc-stick {
      left: max(20px, env(safe-area-inset-left, 0px) + 12px);
      width: 132px; height: 132px; border-radius: 50%;
      background: rgba(255,255,255,.42);
      border: 2px solid rgba(60,45,35,.35);
      box-shadow: 0 4px 14px rgba(0,0,0,.18);
      backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
    }
    .tc-knob {
      position: absolute; left: 50%; top: 50%;
      width: 58px; height: 58px; margin: -29px 0 0 -29px;
      border-radius: 50%;
      background: rgba(255,255,255,.92);
      border: 2px solid rgba(60,45,35,.5);
      box-shadow: 0 3px 10px rgba(0,0,0,.28);
      transition: transform .08s ease-out;
    }
    .tc-stick.tc-active .tc-knob { transition: none; }
    .tc-mom {
      right: max(20px, env(safe-area-inset-right, 0px) + 12px);
      width: 92px; height: 92px; border-radius: 50%;
      font: 600 15px/1 system-ui, sans-serif; color: #4a3728;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px;
      background: rgba(255,214,203,.92);
      border: 2px solid rgba(60,45,35,.45);
      box-shadow: 0 4px 14px rgba(0,0,0,.22);
    }
    .tc-mom:active { transform: scale(.93); background: rgba(255,190,175,.95); }
    .tc-mom span { font-size: 26px; }
    @media (prefers-color-scheme: dark) {
      .tc-stick { background: rgba(40,34,30,.5); border-color: rgba(255,255,255,.3); }
      .tc-knob  { background: rgba(240,235,230,.9); }
    }
    @media (max-height: 430px) {
      .tc-stick { width: 108px; height: 108px; }
      .tc-knob  { width: 48px; height: 48px; margin: -24px 0 0 -24px; }
      .tc-mom   { width: 76px; height: 76px; font-size: 13px; }
      .tc-mom span { font-size: 21px; }
    }`;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.className = 'tc-layer';
  layer.innerHTML =
    '<div class="tc-stick"><div class="tc-knob"></div></div>' +
    '<button class="tc-mom" type="button"><span>👩</span>MOM</button>';
  document.body.appendChild(layer);

  const stick = layer.querySelector('.tc-stick');
  const knob  = layer.querySelector('.tc-knob');
  const mom   = layer.querySelector('.tc-mom');

  /* ---------- joystick ---------- */
  const DEAD = 0.30;   // ignore tiny wobble around centre
  const ON   = 0.38;   // axis threshold — lets two axes latch for diagonals
  let pid = null;

  function move(e) {
    if (pid !== e.pointerId) return;
    const r = stick.getBoundingClientRect();
    const radius = r.width / 2;
    let nx = (e.clientX - (r.left + radius)) / radius;
    let ny = (e.clientY - (r.top  + radius)) / radius;

    const mag = Math.hypot(nx, ny);
    if (mag > 1) { nx /= mag; ny /= mag; }   // clamp knob inside the base

    knob.style.transform = `translate(${nx * radius * 0.62}px, ${ny * radius * 0.62}px)`;

    const next = new Set();
    if (mag >= DEAD) {
      if (ny < -ON) next.add('ArrowUp');
      if (ny >  ON) next.add('ArrowDown');
      if (nx < -ON) next.add('ArrowLeft');
      if (nx >  ON) next.add('ArrowRight');
    }
    setHeld(next);
  }

  function end(e) {
    if (pid !== e.pointerId) return;
    pid = null;
    stick.classList.remove('tc-active');
    knob.style.transform = '';
    releaseAll();
  }

  stick.addEventListener('pointerdown', e => {
    pid = e.pointerId;
    try { stick.setPointerCapture(pid); } catch { /* not all pointers can be captured */ }
    stick.classList.add('tc-active');
    move(e);
    e.preventDefault();
  });
  stick.addEventListener('pointermove', move);
  stick.addEventListener('pointerup', end);
  stick.addEventListener('pointercancel', end);

  /* ---------- Mom ---------- */
  mom.addEventListener('pointerdown', e => {
    e.preventDefault();
    send('keydown', ' ');
    send('keyup', ' ');
  });

  /* The start screens tell you to press WASD, which is useless on a phone.
   * Rewrite that one line to describe the controls actually on screen. */
  for (const p of document.querySelectorAll('p')) {
    if (/to crawl/i.test(p.textContent) && p.querySelector('kbd')) {
      p.innerHTML = 'Drag the <b>joystick</b> to crawl · tap <b>MOM</b> to call Mom';
    }
  }

  /* Losing the tab mid-hold would otherwise leave keys stuck down. */
  addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => document.hidden && releaseAll());

  /* Fade the controls back while a menu or end screen is up, so they don't
   * compete with the buttons there. `running` is a top-level game binding. */
  setInterval(() => {
    let playing = true;
    try { playing = running; } catch { /* older builds may not expose it */ }
    layer.classList.toggle('tc-idle', !playing);
  }, 250);
})();
