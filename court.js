// SVG-Spielfeld: eigene Hälfte, Netz oben, Spieler-Token (ziehbar), Geister-Punkte und Linien.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const BOUNDS = { xMin: -0.6, xMax: 9.6, yMin: 0.35, yMax: 12 };

  function node(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (parent) parent.appendChild(e);
    return e;
  }
  const label = (parent, x, y, text, cls) => {
    const t = node('text', { x, y, class: cls }, parent);
    t.textContent = text;
    return t;
  };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function createCourt(svg, onMove, onTap) {
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '-1 -2.4 11 14.8');
    node('rect', { x: 0, y: -2, width: 9, height: 2, class: 'opp' }, svg);
    label(svg, 4.5, -0.8, 'Gegner', 'zone-label');
    node('rect', { x: 0, y: 0, width: 9, height: 9, class: 'court' }, svg);
    node('rect', { x: 0, y: 9, width: 9, height: 3, class: 'serve-zone' }, svg);
    node('line', { x1: 0, y1: 3, x2: 9, y2: 3, class: 'line' }, svg);
    node('line', { x1: 0, y1: 0, x2: 9, y2: 0, class: 'net' }, svg);
    node('line', { x1: 0, y1: 9, x2: 9, y2: 9, class: 'line' }, svg);
    node('line', { x1: 0, y1: 0, x2: 0, y2: 9, class: 'line' }, svg);
    node('line', { x1: 9, y1: 0, x2: 9, y2: 9, class: 'line' }, svg);
    label(svg, 4.5, 11.6, 'Aufschlagzone', 'zone-label');
    const cells = { 4: [1.5, 1.5], 3: [4.5, 1.5], 2: [7.5, 1.5], 5: [1.5, 6], 6: [4.5, 6], 1: [7.5, 6] };
    Object.entries(cells).forEach(([slot, [x, y]]) => label(svg, x, y + 0.5, slot, 'cell-number'));

    const overlay = node('g', { class: 'overlay' }, svg);
    const tokenLayer = node('g', {}, svg);
    const tokens = new Map();
    const ballLayer = node('g', { class: 'ball-layer', display: 'none' }, svg);
    const shadow = node('ellipse', { rx: 0.3, ry: 0.15, class: 'ball-shadow' }, ballLayer);
    const ball = node('circle', { r: 0.3, class: 'ball' }, ballLayer);
    const bubble = node('g', { class: 'bubble', display: 'none' }, svg);
    const bubbleBg = node('rect', { rx: 0.25, height: 0.9, class: 'bubble-bg' }, bubble);
    const bubbleText = label(bubble, 0, 0, '', 'bubble-text');
    let bubbleTimer = 0;
    let drag = null;
    let focusKey = null;

    function applyFocus() {
      tokens.forEach((g, key) => {
        g.classList.toggle('focus', focusKey !== null && String(key) === String(focusKey));
        g.classList.toggle('dim', focusKey !== null && String(key) !== String(focusKey));
      });
    }
    const setFocus = (key) => { focusKey = key; applyFocus(); };

    function showBubble(g) {
      const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(g.style.transform);
      if (!m) return;
      const text = g.querySelector('title').textContent;
      const w = text.length * 0.24 + 0.6;
      const x = clamp(Number(m[1]), w / 2 - 0.8, 9.8 - w / 2);
      bubble.setAttribute('transform', `translate(${x} ${Number(m[2]) - 1.2})`);
      bubbleText.setAttribute('y', 0.3);
      bubbleText.textContent = text;
      bubbleBg.setAttribute('x', -w / 2);
      bubbleBg.setAttribute('y', -0.45);
      bubbleBg.setAttribute('width', w);
      bubble.setAttribute('display', '');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.setAttribute('display', 'none'), 2200);
    }

    function place(g, x, y) {
      g.style.transform = `translate(${x}px, ${y}px)`;
    }

    function ensureToken(key) {
      if (tokens.has(key)) return tokens.get(key);
      const g = node('g', { class: 'token' }, tokenLayer);
      node('circle', { r: 0.62, class: 'body' }, g);
      label(g, 0, 0.22, '', 'name').setAttribute('data-role', 'name');
      node('circle', { cx: 0.5, cy: -0.5, r: 0.27, class: 'badge' }, g);
      label(g, 0.5, -0.4, '', 'badge-text').setAttribute('data-role', 'badge');
      tokens.set(key, g);
      return g;
    }

    // Token-Schlüssel ist standardmäßig die Position; mit t.key (z. B. Rollen-ID) wandern Spieler über Rotationen hinweg.
    // t.duration/t.delay (Sekunden) steuern die Bewegung, t.passer markiert Annehmer.
    function setTokens(list) {
      const seen = new Set(list.map((t) => t.key ?? t.slot));
      tokens.forEach((g, key) => { if (!seen.has(key)) { g.remove(); tokens.delete(key); } });
      list.forEach((t) => {
        const g = ensureToken(t.key ?? t.slot);
        g.setAttribute('class', ['token', t.kind || 'normal', t.status || '', t.movable ? 'movable' : '', t.passer ? 'passer' : ''].join(' ').trim());
        g.dataset.slot = t.slot;
        g.dataset.key = t.key ?? t.slot;
        g.style.transitionDuration = `${t.duration ?? 0.35}s`;
        g.style.transitionDelay = `${t.delay ?? 0}s`;
        g.querySelector('[data-role="name"]').textContent = t.text;
        g.querySelector('[data-role="badge"]').textContent = t.slot;
        const title = g.querySelector('title') || node('title', {}, g);
        title.textContent = `${t.name || t.text} (Position ${t.slot})`;
        place(g, t.x, t.y);
      });
      applyFocus();
    }

    // Ball: x/y am Boden, z = Höhe in Metern (wird nach oben versetzt gezeichnet). null versteckt ihn.
    function setBall(b) {
      ballLayer.setAttribute('display', b ? '' : 'none');
      if (!b) return;
      shadow.setAttribute('cx', b.x);
      shadow.setAttribute('cy', b.y);
      ball.setAttribute('cx', b.x);
      ball.setAttribute('cy', b.y - b.z * 0.3);
      ball.setAttribute('r', 0.3 + 0.025 * b.z);
    }

    function setOverlay({ ghosts = [], lines = [] } = {}) {
      overlay.innerHTML = '';
      lines.forEach((l) => node('line', { x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, class: `link ${l.cls || ''}` }, overlay));
      ghosts.forEach((g) => {
        node('circle', { cx: g.x, cy: g.y, r: g.r || 0.62, class: `ghost ${g.cls || ''}` }, overlay);
        label(overlay, g.x, g.y + 0.22, g.text || '', 'ghost-text');
      });
    }

    function toSvg(e) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: clamp(p.x, BOUNDS.xMin, BOUNDS.xMax), y: clamp(p.y, BOUNDS.yMin, BOUNDS.yMax) };
    }

    svg.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.token');
      if (!g) { bubble.setAttribute('display', 'none'); return; }
      showBubble(g);
      if (onTap) onTap(g.dataset.key, g);
      if (!g.classList.contains('movable')) return;
      drag = { slot: Number(g.dataset.slot), g, id: e.pointerId };
      svg.setPointerCapture(e.pointerId);
      g.classList.add('dragging');
      g.style.transition = 'none';
      e.preventDefault();
    });
    svg.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = toSvg(e);
      place(drag.g, p.x, p.y);
      bubble.setAttribute('display', 'none');
      onMove(drag.slot, p, false);
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = toSvg(e);
      const { slot, g } = drag;
      drag = null;
      g.classList.remove('dragging');
      g.style.transition = '';
      onMove(slot, p, true);
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);

    return { setTokens, setOverlay, setBall, setFocus };
  }

  globalThis.VR = Object.assign(globalThis.VR || {}, { createCourt });
})();
