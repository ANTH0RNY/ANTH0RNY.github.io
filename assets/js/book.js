/* Page-flip engine. A fixed stage holds a book; each viewport of scroll turns
   one leaf (a two-page spread on wide screens, one page on narrow ones).
   prefers-reduced-motion gets a plain vertical stack instead. */
(() => {
  const SITE = window.SITE;
  const srcs = [...document.querySelectorAll('template.src')];
  const N = srcs.length;
  const ids = srcs.map(t => t.dataset.id);
  const $ = id => document.getElementById(id);
  const stage = $('stage'), shift = $('shift'), book = $('book'), stack = $('stack'), track = $('track');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const { rng, hash } = window.PLATE_RNG;
  const AUDIT = /[?&]audit\b/.test(location.search);
  const STILL = /[?&]still\b/.test(location.search); // testing: open on the hash page without scrolling

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');

  /* Sections for the bottom bar: first page of each named section. */
  const SECTIONS = window.SECTIONS.map(n => ({n, s: srcs.findIndex(t => t.dataset.section === n)})).filter(x => x.s >= 0);
  SECTIONS.push({n: '', s: N});
  $('secs').innerHTML = SECTIONS.slice(0, -1).map((x, i) =>
    `<li><button class="sec" data-goto="${x.s}"><span>${pad(i + 1)}</span><span class="sec-l">${x.n}</span><span class="sec-line"></span></button></li>`).join('');
  const secBtns = [...document.querySelectorAll('.sec')];
  document.querySelectorAll('[data-mast]').forEach(el => el.textContent = SITE.masthead);

  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);

  let mode = '', leaves = [], faces = [], L = 0, maxStep = 0, vh = 0, pageW = 0, lastW = 0;
  let p = 0, target = 0, raf = 0, liveStep = -1;

  /* ---------- drawing ---------- */
  function fitText(root){
    (root || document).querySelectorAll('[data-fit]').forEach(el => {
      el.style.fontSize = '';
      const box = el.parentElement.clientWidth;
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollWidth > box){
        const fs = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = (fs * Math.min(el.clientWidth || box, box) / el.scrollWidth * .98) + 'px';
      }
    });
  }

  /* Safety net: a page whose content does not fit is scaled down a little (--k)
     instead of scrolling. Copy should be cut first; this covers short screens. */
  function overflow(pg){
    const cs = getComputedStyle(pg), limit = pg.clientHeight - parseFloat(cs.paddingBottom);
    let bottom = 0;
    for (const el of pg.children){
      if (getComputedStyle(el).position === 'absolute') continue;
      bottom = Math.max(bottom, el.offsetTop + el.offsetHeight);
    }
    return bottom - limit;
  }
  function fitPages(){
    faces.forEach(f => {
      const pg = f && f.querySelector('.pg'); if (!pg) return;
      pg.style.removeProperty('--k');
      let k = 1;
      while (overflow(pg) > 1 && k > .76){ k = +(k - .03).toFixed(2); pg.style.setProperty('--k', k); }
      if (k < 1) fitText(pg);
    });
  }
  function layoutPages(){ fitText(); fitPages(); document.querySelectorAll('canvas.plate').forEach(drawPlate); }

  function drawPlate(c){
    const w = c.clientWidth, h = c.clientHeight; if (!w || !h) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(w * d); c.height = Math.round(h * d);
    const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h);
    const k = c.dataset.plate; window.PLATES[k] && window.PLATES[k](x, w, h, rng(hash(k)));
  }

  function barcode(el){
    const r = rng(+el.dataset.barcode * 977 + 13); let xp = 0, out = '';
    const bar = (bw, tall) => { out += `<rect x="${xp}" y="0" width="${bw}" height="${tall ? 30 : 27}"/>`; xp += bw; };
    bar(1, 1); xp += 1; bar(1, 1); xp += 1;
    for (let i = 0; i < 44; i++){ const bw = 1 + Math.floor(r() * 3); i % 2 ? (xp += bw) : bar(bw); }
    xp += 1; bar(1, 1); xp += 1; bar(1, 1);
    el.innerHTML = `<svg viewBox="0 0 ${xp} 30" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">${out}</svg><span><b>9</b><b>254757</b><b>2026${pad(+el.dataset.barcode)}</b></span>`;
  }

  /* ---------- building ---------- */
  function makeFace(idx, side){
    const f = document.createElement('div');
    f.className = 'face' + (side ? ' ' + side : '');
    if (idx != null && idx < N){
      f.appendChild(srcs[idx].content.cloneNode(true));
      f.dataset.page = idx;
      f.id = 'page-' + ids[idx];
      f.setAttribute('role', 'group');
      f.setAttribute('aria-label', 'Page ' + (idx + 1));
      const pg = f.querySelector('.pg');
      pg.classList.add(idx % 2 === 0 ? 'recto' : 'verso');
      if (pg.hasAttribute('data-folio')){
        const fo = document.createElement('div'); fo.className = 'folio';
        fo.innerHTML = `<span class="no">${pad(idx + 1)}</span><span>${SITE.masthead} · ${SITE.issue}</span><span>${srcs[idx].dataset.section}</span>`;
        pg.appendChild(fo);
      }
      faces[idx] = f;
    } else f.classList.add('blank');
    if (side){ const sh = document.createElement('div'); sh.className = 'shade'; f.appendChild(sh); }
    return f;
  }

  function pickMode(){
    if (reduce.matches) return 'stack';
    const W = document.documentElement.clientWidth, H = probe.offsetHeight || innerHeight;
    return (W >= 860 && W / H > 1.05) ? 'spread' : 'single';
  }

  function sizing(){
    const W = document.documentElement.clientWidth;
    vh = probe.offsetHeight || innerHeight;
    let pw, ph, bw, left = 0;
    const bars = document.querySelector('.topbar').offsetHeight + document.querySelector('.botbar').offsetHeight + 12;
    if (mode === 'spread'){ ph = Math.min(vh - bars, (W - 120) / 1.44); pw = ph * .72; bw = pw * 2; left = pw; }
    else if (mode === 'single'){ ph = vh - bars; pw = Math.min(W - 24, ph * .9); bw = pw; }
    else { pw = Math.min(680, W - 32); ph = W < 640 ? Math.max(pw * 1.6, 560) : pw / .72; bw = pw; }
    pageW = pw;
    const s = document.documentElement.style;
    s.setProperty('--pageW', pw + 'px'); s.setProperty('--pageH', ph + 'px');
    s.setProperty('--bookW', bw + 'px'); s.setProperty('--leafLeft', left + 'px');
    track.innerHTML = '';
    if (mode !== 'stack'){
      for (let i = 0; i <= maxStep; i++){ const d = document.createElement('div'); d.style.height = vh + 'px'; track.appendChild(d); }
    }
  }

  function currentPage(){
    if (mode === 'stack'){
      let best = 0; faces.forEach((f, i) => { if (f.getBoundingClientRect().top < innerHeight * .5) best = i; }); return best;
    }
    const s = Math.round(target);
    return mode === 'spread' ? Math.min(2 * s, N - 1) : s;
  }

  function hashPage(){
    const id = decodeURIComponent(location.hash.slice(1));
    const i = ids.indexOf(id);
    return i >= 0 ? i : null;
  }

  function build(keepPage){
    mode = pickMode();
    document.documentElement.classList.toggle('no-snap', mode === 'stack');
    stage.className = 'stage mode-' + mode; stack.className = 'stack mode-' + mode;
    book.innerHTML = ''; stack.innerHTML = ''; leaves = []; faces = []; liveStep = -1;
    stage.hidden = mode === 'stack'; stack.hidden = mode !== 'stack';
    $('hintText').textContent = mode === 'stack' ? 'Scroll to read' : 'Scroll to turn';
    if (mode === 'stack'){
      L = 0; maxStep = 0;
      for (let i = 0; i < N; i++) stack.appendChild(makeFace(i, ''));
    } else {
      L = mode === 'spread' ? Math.ceil(N / 2) : N;
      maxStep = mode === 'spread' ? L : N - 1;
      for (let k = 0; k < L; k++){
        const leaf = document.createElement('div'); leaf.className = 'leaf';
        const fi = mode === 'spread' ? 2 * k : k, bi = mode === 'spread' ? 2 * k + 1 : null;
        leaf.appendChild(makeFace(fi, 'front')); leaf.appendChild(makeFace(bi, 'back'));
        leaf._t = -1; leaf._b = -1; leaf._z = null; leaf._w = null;
        leaf._sh = [...leaf.querySelectorAll(':scope > .face > .shade')];
        book.appendChild(leaf); leaves.push(leaf);
      }
    }
    sizing();
    document.querySelectorAll('[data-barcode]').forEach(barcode);
    requestAnimationFrame(layoutPages);
    if (mode === 'stack'){
      if (keepPage != null) faces[keepPage]?.scrollIntoView({block: 'start'});
      updateUI(); return;
    }
    const step = keepPage == null ? clamp(Math.round(scrollY / vh), 0, maxStep) : stepOf(keepPage);
    if (keepPage != null && !STILL) window.scrollTo({top: step * vh, behavior: 'instant'});
    p = target = step;
    render();
  }

  const stepOf = idx => mode === 'spread' ? Math.ceil(idx / 2) : idx;

  /* ---------- rendering ---------- */
  /* Per frame this only writes transforms and shade opacity, which the compositor
     handles without restyling or repainting the pages. Every write is skipped when
     the value has not changed. */
  let lastShift = null;
  function render(){
    const f = Math.floor(p);
    for (let k = 0; k < L; k++){
      const leaf = leaves[k], t = clamp(p - k, 0, 1);
      // only the leaves around the open spread are drawn; the rest of the stack stays hidden
      const vis = k >= f - 1 && k <= f + 1;
      if (vis !== leaf._v){ leaf._v = vis; leaf.style.visibility = vis ? '' : 'hidden'; }
      // GPU layers only for leaves that are on screen or about to be
      const warm = k >= f - 2 && k <= f + 2;
      if (warm !== leaf._w){ leaf._w = warm; leaf.classList.toggle('warm', warm); }
      if (t === leaf._t) continue;
      leaf._t = t;
      const e = t * t * (3 - 2 * t), b = Math.sin(Math.PI * e);
      leaf.style.transform = `rotateY(${(-180 * e).toFixed(2)}deg) skewY(${(-b * 2.2).toFixed(2)}deg)`;
      const o = Math.round(b * 85) / 100;
      if (o !== leaf._b){ leaf._b = o; for (const sh of leaf._sh) sh.style.opacity = o; }
      const z = t <= 0 ? L - k : t >= 1 ? k + 1 : L + 5;
      if (z !== leaf._z){ leaf._z = z; leaf.style.zIndex = z; }
    }
    const sx = mode === 'spread'
      ? `translateX(${(pageW / 2 * (-(1 - clamp(p, 0, 1)) + clamp(p - (L - 1), 0, 1))).toFixed(1)}px)` : '';
    if (sx !== lastShift){ lastShift = sx; shift.style.transform = sx; }
    const s = clamp(Math.round(p), 0, maxStep);
    if (s !== liveStep){ liveStep = s; setLive(s); }
    updateUI();
  }

  function setLive(s){
    leaves.forEach((leaf, k) => {
      const [front, back] = leaf.children;
      const frontOn = k === s, backOn = mode === 'spread' && k === s - 1;
      front.inert = !frontOn; back.inert = !backOn;
    });
  }

  let lastHash = null;
  const UI = {folio: $('folioLabel'), sec: $('secLabel'), hint: $('hint'), prev: $('prevBtn'), next: $('nextBtn')};
  const put = (el, prop, v) => { if (el['_' + prop] !== v){ el['_' + prop] = v; el[prop] = v; } };
  function updateUI(){
    let idx, label, pageF, first;
    if (mode === 'stack'){ idx = first = currentPage(); pageF = idx; label = 'p. ' + pad(idx + 1) + ' / ' + N; }
    else if (mode === 'spread'){
      const s = clamp(Math.round(p), 0, maxStep);
      idx = Math.min(2 * s, N - 1); first = Math.max(0, Math.min(2 * s - 1, N - 1)); pageF = Math.min(p * 2, N - 1);
      label = s === 0 ? 'Cover' : s === maxStep ? 'Back cover' : 'pp. ' + pad(2 * s) + '–' + pad(2 * s + 1) + ' / ' + N;
    } else {
      idx = first = clamp(Math.round(p), 0, N - 1); pageF = p;
      label = idx === 0 ? 'Cover' : idx === N - 1 ? 'Back cover' : 'p. ' + pad(idx + 1) + ' / ' + N;
    }
    put(UI.folio, 'textContent', label);
    put(UI.sec, 'textContent', srcs[idx].dataset.section);
    let si = 0; for (let i = 0; i < SECTIONS.length - 1; i++) if (idx >= SECTIONS[i].s) si = i;
    secBtns.forEach((b, i) => {
      if (b._cur !== (i === si)){ b._cur = i === si; b.setAttribute('aria-current', String(b._cur)); }
      if (i === si){
        const a = SECTIONS[i].s, z = SECTIONS[i + 1].s - 1;
        const sp = z > a ? clamp((pageF - a) / (z - a), 0, 1).toFixed(2) : '1';
        if (b._sp !== sp){ b._sp = sp; b.style.setProperty('--sp', sp); }
      }
    });
    if (UI.hint._gone !== idx > 0){ UI.hint._gone = idx > 0; UI.hint.classList.toggle('gone', idx > 0); }
    const step = mode === 'stack' ? idx : Math.round(target);
    const last = mode === 'stack' ? N - 1 : maxStep;
    put(UI.prev, 'disabled', step <= 0); put(UI.next, 'disabled', step >= last);
    // keep a shareable link to the page in view
    if (!raf || mode === 'stack'){
      const h = first === 0 ? '' : '#' + ids[first];
      if (h !== lastHash){ lastHash = h; history.replaceState(null, '', h || location.pathname + location.search); }
    }
  }

  /* Exponential easing toward the scroll position, by elapsed time rather than per
     frame, so a turn feels the same at 60, 120 or 144 Hz. TAU = 110ms matches the
     original 0.14-per-frame feel at 60 Hz. */
  const TAU = 110;
  let lastT = 0;
  function tick(now){
    const dt = Math.min(64, now - (lastT || now - 16.7)); lastT = now;
    p += (target - p) * (1 - Math.exp(-dt / TAU));
    if (Math.abs(target - p) < .001) p = target;
    render();
    raf = p !== target ? requestAnimationFrame(tick) : 0;
    if (!raf){ lastT = 0; updateUI(); }
  }
  function kick(){ if (!raf) raf = requestAnimationFrame(tick); }

  addEventListener('scroll', () => {
    if (mode === 'stack'){ updateUI(); return; }
    target = clamp(scrollY / vh, 0, maxStep); kick();
  }, {passive: true});

  /* ---------- navigation ---------- */
  function goStep(step){
    if (mode === 'stack'){ faces[clamp(step, 0, N - 1)]?.scrollIntoView({behavior: 'auto', block: 'start'}); return; }
    window.scrollTo({top: clamp(step, 0, maxStep) * vh, behavior: 'smooth'});
  }
  function goPage(idx){ goStep(mode === 'stack' ? idx : stepOf(idx)); }
  function curStep(){ return mode === 'stack' ? currentPage() : Math.round(target); }

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if (g){ e.preventDefault(); goPage(+g.dataset.goto); return; }
    const c = e.target.closest('[data-copy]');
    if (c){
      const lbl = c.querySelector('span');
      const done = t => { lbl.textContent = t; setTimeout(() => lbl.textContent = 'Copy address', 2000); };
      try { navigator.clipboard.writeText(c.dataset.copy).then(() => done('Copied'), () => done('Select to copy')); }
      catch (_) { done('Select to copy'); }
    }
  });
  $('prevBtn').addEventListener('click', () => goStep(curStep() - 1));
  $('nextBtn').addEventListener('click', () => goStep(curStep() + 1));
  addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown'){ e.preventDefault(); goStep(curStep() + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); goStep(curStep() - 1); }
    else if (e.key === 'Home'){ e.preventDefault(); goStep(0); }
    else if (e.key === 'End'){ e.preventDefault(); goStep(1e9); }
  });
  addEventListener('hashchange', () => { const i = hashPage(); if (i != null) goPage(i); });

  let rt;
  function onResize(){
    clearTimeout(rt);
    rt = setTimeout(() => {
      const W = document.documentElement.clientWidth, H = probe.offsetHeight || innerHeight;
      if (W === lastW && H === vh && pickMode() === mode) return;
      lastW = W;
      build(currentPage());
    }, 160);
  }
  addEventListener('resize', onResize);
  reduce.addEventListener?.('change', () => build(currentPage()));

  /* ---------- overflow audit (?audit): reports pages whose content does not fit ---------- */
  function audit(){
    const out = [];
    faces.forEach((f, i) => {
      const pg = f.querySelector('.pg'); if (!pg) return;
      let right = 0;
      for (const el of pg.children) if (getComputedStyle(el).position !== 'absolute') right = Math.max(right, el.offsetLeft + el.offsetWidth);
      const over = Math.round(overflow(pg)), wide = Math.round(right - pg.clientWidth);
      const plate = pg.querySelector('.plate-wrap');
      out.push({page: i + 1, id: ids[i], k: pg.style.getPropertyValue('--k') || 1, over, wide, plateH: plate ? Math.round(plate.offsetHeight / pg.clientHeight * 100) : null, folioOk: over <= 1});
    });
    const bad = out.filter(o => o.over > 1 || o.wide > 1 || !o.folioOk || (o.plateH != null && o.plateH < 14));
    const pre = document.createElement('pre'); pre.id = 'audit';
    pre.textContent = JSON.stringify({mode, w: innerWidth, h: innerHeight, bad, all: out});
    document.body.appendChild(pre);
  }

  lastW = document.documentElement.clientWidth;
  build(hashPage());
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  let ft; document.fonts?.addEventListener?.('loadingdone', () => { clearTimeout(ft); ft = setTimeout(layoutPages, 60); });
  ready.then(() => {
    layoutPages();
    if (AUDIT) setTimeout(audit, 300);
  });
})();
