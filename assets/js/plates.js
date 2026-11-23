/* Generative plates. Each is drawn with a seeded RNG, so a plate looks the
   same on every visit. Palette: ink, bone, chrome and red only. */
(() => {
  const INK = '#0c0b0d', P = '239,235,228', CH = '201,204,209', RED = '#c4111f', RED_L = '240,72,77';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2;

  function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s){ let h = 2166136261; for (const c of s){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  const PLATES = {
    /* cover sun */
    halftone(x, w, h, r){
      const s = w / 36, cx = w * .6, cy = h * .42, R = w * .37;
      x.fillStyle = INK;
      let row = 0;
      for (let gy = s / 2; gy < h + s; gy += s, row++){
        for (let gx = row % 2 ? s : s / 2; gx < w + s; gx += s){
          const d = Math.hypot(gx - cx, gy - cy);
          let v;
          if (d < R){
            v = .22 + .72 * clamp((gy - (cy - R)) / (2 * R), 0, 1);
            const band = (gy - cy) / R;
            if (band > .08 && Math.floor(band * 10) % 2 === 1) v *= .3;
          } else v = Math.max(0, .2 - (d - R) / (w * .55));
          v *= .9 + r() * .2;
          const rad = s * .5 * Math.min(1, v);
          if (rad > .35){ x.beginPath(); x.arc(gx, gy, rad, 0, TAU); x.fill(); }
        }
      }
    },

    /* portrait / back cover linework */
    cables(x, w, h, r){
      for (let i = 0; i < 48; i++){
        const x0 = w * (.3 + r() * .8), x3 = w * (.2 + r() * .95);
        x.beginPath(); x.moveTo(x0, -20);
        x.bezierCurveTo(x0 + (r() - .5) * w * 1.2, h * (.2 + r() * .3), x3 + (r() - .5) * w * 1.2, h * (.5 + r() * .3), x3, h + 20);
        const red = i % 16 === 0;
        x.strokeStyle = red ? `rgba(${RED_L},.55)` : `rgba(${CH},${.04 + r() * .14})`;
        x.lineWidth = red ? 1.2 : .5 + r() * 1.4;
        x.stroke();
      }
    },

    /* M365 collector: one metric ridgeline per tenant, one in alert */
    metrics(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      x.strokeStyle = `rgba(${CH},.07)`; x.lineWidth = 1;
      for (let i = 1; i < 12; i++){ x.beginPath(); x.moveTo(w * i / 12, 0); x.lineTo(w * i / 12, h); x.stroke(); }
      const rows = 20, top = h * .14, gap = (h * .95 - top) / rows, step = Math.max(2, w / 160), amp = gap * 2.6;
      const alertRow = 12;
      for (let i = 0; i < rows; i++){
        const y0 = top + i * gap, pts = [];
        let v = 0, vel = 0;
        const peaks = Array.from({length: 2 + Math.floor(r() * 3)}, () => ({c: r() * w, s: w * (.02 + r() * .06), a: r() * (i === alertRow ? 1.8 : 1)}));
        for (let px = 0; px <= w + step; px += step){
          vel = vel * .8 + (r() - .5) * .25; v = clamp(v * .92 + vel, -.2, 1);
          let y = Math.max(0, v) * .35;
          for (const p of peaks) y += p.a * Math.exp(-((px - p.c) ** 2) / (2 * p.s * p.s));
          pts.push([px, y0 - Math.min(y, 2.2) * amp * .5]);
        }
        x.beginPath(); x.moveTo(0, h);
        for (const [px, py] of pts) x.lineTo(px, py);
        x.lineTo(w, h); x.closePath(); x.fillStyle = INK; x.fill();
        x.beginPath(); pts.forEach(([px, py], k) => k ? x.lineTo(px, py) : x.moveTo(px, py));
        const red = i === alertRow;
        x.strokeStyle = red ? `rgba(${RED_L},.95)` : `rgba(${CH},${.25 + (i / rows) * .45})`;
        x.lineWidth = red ? 1.6 : .9;
        x.stroke();
        if (red){
          x.setLineDash([4, 5]); x.strokeStyle = `rgba(${RED_L},.6)`; x.lineWidth = 1;
          x.beginPath(); x.moveTo(0, y0 - amp * .62); x.lineTo(w, y0 - amp * .62); x.stroke(); x.setLineDash([]);
        }
      }
    },

    /* OT pilot: switch-side topology; controllers are only ever listened to */
    network(x, w, h, r){
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#5e0710'); g.addColorStop(1, '#2a0307');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      const line = a => { x.strokeStyle = `rgba(${P},${a})`; };
      const core = [w * .5, h * .14];
      const nS = 4, sw = [], leaves = [];
      for (let i = 0; i < nS; i++) sw.push([w * (.14 + i * .24), h * .38]);
      sw.forEach(([sx, sy], i) => {
        x.lineWidth = 1.2; line(.55);
        x.beginPath(); x.moveTo(core[0], core[1]); x.lineTo(core[0], (core[1] + sy) / 2); x.lineTo(sx, (core[1] + sy) / 2); x.lineTo(sx, sy); x.stroke();
        const n = 3 + Math.floor(r() * 3);
        for (let j = 0; j < n; j++){
          const lx = sx + (j - (n - 1) / 2) * w * .045, ly = h * (.62 + (j % 2) * .1 + r() * .04);
          x.lineWidth = .8; line(.3);
          x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx, sy + h * .08); x.lineTo(lx, sy + h * .08); x.lineTo(lx, ly); x.stroke();
          leaves.push([lx, ly, i, j]);
        }
      });
      // passive listening rings around the switches
      sw.forEach(([sx, sy]) => {
        x.setLineDash([2, 4]); line(.35); x.lineWidth = .8;
        for (let k = 1; k <= 3; k++){ x.beginPath(); x.arc(sx, sy, k * w * .018, 0, TAU); x.stroke(); }
        x.setLineDash([]);
        x.fillStyle = '#2a0307'; x.fillRect(sx - w * .025, sy - w * .012, w * .05, w * .024);
        line(.9); x.lineWidth = 1.2; x.strokeRect(sx - w * .025, sy - w * .012, w * .05, w * .024);
      });
      // core switch
      x.fillStyle = `rgba(${P},.9)`; x.fillRect(core[0] - w * .04, core[1] - w * .014, w * .08, w * .028);
      // controllers: chassis with module slots; one degraded
      const bad = Math.floor(r() * leaves.length);
      leaves.forEach(([lx, ly], k) => {
        const cw = w * .032, chh = w * .05;
        x.fillStyle = '#2a0307'; x.fillRect(lx - cw / 2, ly, cw, chh);
        x.strokeStyle = k === bad ? '#ff8a8d' : `rgba(${P},.7)`; x.lineWidth = k === bad ? 1.6 : 1;
        x.strokeRect(lx - cw / 2, ly, cw, chh);
        for (let s = 1; s < 4; s++){ x.beginPath(); x.moveTo(lx - cw / 2 + cw * s / 4, ly + 2); x.lineTo(lx - cw / 2 + cw * s / 4, ly + chh - 2); x.stroke(); }
        if (k === bad){ x.beginPath(); x.arc(lx, ly + chh / 2, w * .045, 0, TAU); x.setLineDash([3, 3]); x.stroke(); x.setLineDash([]); }
      });
    },

    /* vmware-automation: golden template and its clones */
    clones(x, w, h, r){
      x.fillStyle = '#e2dbcf'; x.fillRect(0, 0, w, h);
      const cols = 9, rows = 5, gx = w * .04, cw = (w - gx * (cols + 1)) / cols, chh = (h * .86 - gx * (rows + 1)) / rows;
      const hot = Math.floor(r() * (cols * rows - 1)) + 1;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
        const k = j * cols + i, X = gx + i * (cw + gx), Y = gx + j * (chh + gx);
        const tmpl = k === 0;
        x.fillStyle = tmpl ? INK : 'rgba(12,11,13,.04)'; x.fillRect(X, Y, cw, chh);
        x.strokeStyle = k === hot ? RED : `rgba(12,11,13,${tmpl ? 1 : .35 + r() * .3})`; x.lineWidth = k === hot ? 2 : 1;
        x.strokeRect(X + .5, Y + .5, cw - 1, chh - 1);
        // OS layers
        const layers = 4;
        for (let l = 1; l <= layers; l++){
          const ly = Y + chh * (l / (layers + 1));
          x.strokeStyle = tmpl ? `rgba(${P},.7)` : k === hot ? 'rgba(196,17,31,.7)' : 'rgba(12,11,13,.25)';
          x.lineWidth = .8; x.beginPath(); x.moveTo(X + cw * .15, ly); x.lineTo(X + cw * (.4 + r() * .45), ly); x.stroke();
        }
      }
      // clone arrows from template
      x.strokeStyle = 'rgba(196,17,31,.5)'; x.lineWidth = 1; x.setLineDash([3, 4]);
      const sx = gx + cw, sy = gx + chh / 2;
      for (let j = 0; j < rows; j++){ const ty = gx + j * (chh + gx) + chh / 2; x.beginPath(); x.moveTo(sx, sy); x.bezierCurveTo(sx + gx * 2, sy, sx - gx, ty, sx + gx, ty); x.stroke(); }
      x.setLineDash([]);
    },

    /* Construction: contour survey with a site boundary polygon */
    contour(x, w, h, r){
      x.fillStyle = '#e2dbcf'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(12,11,13,.08)'; x.lineWidth = 1;
      for (let i = 1; i < 10; i++){ x.beginPath(); x.moveTo(w * i / 10, 0); x.lineTo(w * i / 10, h); x.moveTo(0, h * i / 10); x.lineTo(w, h * i / 10); x.stroke(); }
      const m = Math.min(w, h), ph1 = r() * 6, ph2 = r() * 6;
      const bumps = Array.from({length: 4}, () => ({x: w * (.15 + r() * .7), y: h * (.15 + r() * .7), s: m * (.14 + r() * .2), a: .6 + r() * .8}));
      const f = (px, py) => { let v = .18 * Math.sin(px / w * 5 + ph1) * Math.cos(py / h * 4 + ph2); for (const b of bumps){ const dx = px - b.x, dy = py - b.y; v += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s)); } return v; };
      const cs = Math.max(4, w / 120), nx = Math.ceil(w / cs) + 1, ny = Math.ceil(h / cs) + 1;
      const F = new Float32Array(nx * ny); let mn = 1e9, mx = -1e9, mxAt = [0, 0];
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){ const v = f(i * cs, j * cs); F[j * nx + i] = v; if (v < mn) mn = v; if (v > mx){ mx = v; mxAt = [i * cs, j * cs]; } }
      const T = {1:[[3,2]],2:[[2,1]],3:[[3,1]],4:[[0,1]],5:[[3,0],[2,1]],6:[[0,2]],7:[[3,0]],8:[[3,0]],9:[[0,2]],10:[[0,1],[3,2]],11:[[0,1]],12:[[3,1]],13:[[2,1]],14:[[3,2]]};
      const LV = 18;
      for (let l = 1; l < LV; l++){
        const lev = mn + (mx - mn) * l / LV;
        x.beginPath();
        for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++){
          const tl = F[j * nx + i], tr = F[j * nx + i + 1], br = F[(j + 1) * nx + i + 1], bl = F[(j + 1) * nx + i];
          const c = (tl >= lev ? 8 : 0) | (tr >= lev ? 4 : 0) | (br >= lev ? 2 : 0) | (bl >= lev ? 1 : 0);
          const segs = T[c]; if (!segs) continue;
          const X = i * cs, Y = j * cs, t = (a, b) => (lev - a) / (b - a);
          const pt = e => e === 0 ? [X + cs * t(tl, tr), Y] : e === 1 ? [X + cs, Y + cs * t(tr, br)] : e === 2 ? [X + cs * t(bl, br), Y + cs] : [X, Y + cs * t(tl, bl)];
          for (const [a, b] of segs){ const A = pt(a), B = pt(b); x.moveTo(A[0], A[1]); x.lineTo(B[0], B[1]); }
        }
        x.strokeStyle = `rgba(12,11,13,${l % 4 === 0 ? .7 : .42})`;
        x.lineWidth = l % 4 === 0 ? 1.3 : .7;
        x.stroke();
      }
      // site boundary: an irregular polygon around the summit
      const [px, py] = mxAt, n = 7, rad = m * .22;
      const poly = Array.from({length: n}, (_, k) => { const a = k / n * TAU + r() * .4; const rr = rad * (.7 + r() * .5); return [px + Math.cos(a) * rr * 1.3, py + Math.sin(a) * rr]; });
      x.fillStyle = 'rgba(196,17,31,.08)'; x.strokeStyle = RED; x.lineWidth = 1.8; x.setLineDash([7, 4]);
      x.beginPath(); poly.forEach(([a, b], k) => k ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill(); x.stroke(); x.setLineDash([]);
      x.fillStyle = RED; poly.forEach(([a, b]) => { x.fillRect(a - 3, b - 3, 6, 6); });
    },

    /* EDMS: folder hierarchy; one subtree path highlighted */
    tree(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const levels = 5, top = h * .1, dy = (h * .7) / levels;
      const nodes = [{x: w * .5, y: top, d: 0, p: null}];
      let frontier = [nodes[0]];
      for (let d = 1; d <= levels; d++){
        const next = [];
        frontier.forEach(nd => { const k = d === 1 ? 4 : 1 + Math.floor(r() * (d < 4 ? 3.2 : 2.6)); for (let i = 0; i < k; i++){ const c = {d, p: nd, y: top + d * dy}; nodes.push(c); next.push(c); } });
        next.forEach((c, i) => { c.x = w * (.06 + .88 * (i + .5) / next.length); });
        frontier = next;
      }
      // highlighted path: root to a deep leaf
      const deep = nodes.filter(n => n.d === levels);
      const target = deep[Math.floor(r() * deep.length)];
      const onPath = new Set(); for (let n = target; n; n = n.p) onPath.add(n);
      const draw = hot => nodes.forEach(n => {
        if (!n.p || onPath.has(n) !== hot) return;
        const my = (n.p.y + n.y) / 2;
        x.strokeStyle = hot ? `rgba(${RED_L},.95)` : `rgba(${CH},.32)`; x.lineWidth = hot ? 1.8 : .8;
        x.beginPath(); x.moveTo(n.p.x, n.p.y); x.lineTo(n.p.x, my); x.lineTo(n.x, my); x.lineTo(n.x, n.y); x.stroke();
      });
      draw(false); draw(true);
      nodes.forEach(n => {
        const s = n.d === levels ? 3 : 5 - n.d * .6;
        const hot = onPath.has(n);
        if (n.d === levels){ x.strokeStyle = hot ? `rgba(${RED_L},1)` : `rgba(${P},.6)`; x.lineWidth = 1; x.strokeRect(n.x - s, n.y, s * 2, s * 2.6); }
        else { x.fillStyle = hot ? `rgba(${RED_L},1)` : `rgba(${P},.85)`; x.fillRect(n.x - s, n.y - s * .7, s * 2, s * 1.4); }
      });
    },

    /* Events: an auditorium of seats; a block of tickets sold in red */
    seats(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const cx = w * .5, cy = h * 1.25, rows = 16, base = h * .55, gap = h * .055;
      const block = {r0: 5 + Math.floor(r() * 4), a0: -.18 + r() * .2};
      for (let i = 0; i < rows; i++){
        const R = base + i * gap, n = Math.floor(R * 1.1 / (gap * .9));
        for (let k = 0; k <= n; k++){
          const a = -Math.PI / 2 + (k / n - .5) * 1.1;
          const sx = cx + Math.cos(a) * R, sy = cy + Math.sin(a) * R;
          if (sy < -10 || sx < -10 || sx > w + 10) continue;
          const rel = a + Math.PI / 2;
          const inBlock = i >= block.r0 && i < block.r0 + 4 && rel > block.a0 && rel < block.a0 + .16;
          const sold = r() < .55;
          x.beginPath(); x.arc(sx, sy, gap * .2, 0, TAU);
          if (inBlock){ x.fillStyle = `rgba(${RED_L},.95)`; x.fill(); }
          else if (sold){ x.fillStyle = `rgba(${P},${.35 + r() * .4})`; x.fill(); }
          else { x.strokeStyle = `rgba(${CH},.3)`; x.lineWidth = .8; x.stroke(); }
        }
      }
      // stage
      x.strokeStyle = `rgba(${CH},.5)`; x.lineWidth = 1.2;
      x.beginPath(); x.arc(cx, cy, base - gap * 1.4, -Math.PI / 2 - .5, -Math.PI / 2 + .5); x.stroke();
    },

    /* Plant disease: leaf engraving with lesions and a detection frame */
    leaf(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const L = Math.hypot(w * .62, h * .72), W = L * .24;
      x.save(); x.translate(w * .12, h * .86); x.rotate(-Math.atan2(h * .72, w * .62));
      const half = t => W * Math.pow(Math.sin(Math.PI * t), .85) * (1 - .25 * t);
      const edge = (t, s) => [t * L, s * half(t) * (1 + .03 * Math.sin(t * 80))];
      // blade
      x.beginPath();
      for (let i = 0; i <= 200; i++){ const [a, b] = edge(i / 200, 1); i ? x.lineTo(a, b) : x.moveTo(a, b); }
      for (let i = 200; i >= 0; i--){ const [a, b] = edge(i / 200, -1); x.lineTo(a, b); }
      x.closePath(); x.fillStyle = `rgba(${CH},.05)`; x.fill(); x.strokeStyle = `rgba(${CH},.75)`; x.lineWidth = 1.2; x.stroke();
      x.save(); x.clip();
      // midrib, veins and a vein net
      x.strokeStyle = `rgba(${P},.8)`; x.lineWidth = 2; x.beginPath(); x.moveTo(-10, 0); x.lineTo(L, 0); x.stroke();
      const veins = 14;
      for (let s of [1, -1]) for (let k = 1; k < veins; k++){
        const t0 = k / veins * .92, t1 = Math.min(1, t0 + .1);
        const [ex, ey] = edge(t1, s * .92);
        x.strokeStyle = `rgba(${CH},.5)`; x.lineWidth = 1;
        x.beginPath(); x.moveTo(t0 * L, 0); x.quadraticCurveTo(t0 * L + (ex - t0 * L) * .3, ey * .6, ex, ey); x.stroke();
      }
      x.strokeStyle = `rgba(${CH},.13)`; x.lineWidth = .6;
      for (let i = 0; i < 700; i++){
        const t = r(), s = (r() - .5) * 2, [a, b] = [t * L, s * half(t)], ang = r() * TAU, len = W * (.03 + r() * .05);
        x.beginPath(); x.moveTo(a, b); x.lineTo(a + Math.cos(ang) * len, b + Math.sin(ang) * len); x.stroke();
      }
      // lesions: concentric target spots
      const spots = Array.from({length: 6}, () => { const t = .3 + r() * .6, s = (r() - .5) * 1.4; return [t * L, s * half(t), W * (.05 + r() * .07)]; });
      spots.forEach(([a, b, rr]) => {
        for (let k = 4; k >= 1; k--){ x.beginPath(); x.arc(a, b, rr * k / 4, 0, TAU); x.strokeStyle = `rgba(${RED_L},${.25 + k * .12})`; x.lineWidth = 1; x.stroke(); }
        x.beginPath(); x.arc(a, b, rr * .3, 0, TAU); x.fillStyle = `rgba(${RED_L},.85)`; x.fill();
      });
      x.restore();
      // detection frame around the first lesion
      const [a, b, rr] = spots[0], fs = rr * 2.6, c = fs * .35;
      x.strokeStyle = `rgba(${RED_L},1)`; x.lineWidth = 1.6;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
        const X = a + sx * fs, Y = b + sy * fs;
        x.beginPath(); x.moveTo(X - sx * c, Y); x.lineTo(X, Y); x.lineTo(X, Y - sy * c); x.stroke();
      });
      x.restore();
    },

    /* County revenue: stacked monthly bars, one revenue stream in red */
    ledger(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const base = h * .84, top = h * .12, n = 12, gap = w * .022, bw = (w * .86 - gap * (n - 1)) / n, x0 = w * .07;
      x.strokeStyle = `rgba(${CH},.12)`; x.lineWidth = 1;
      for (let i = 0; i <= 5; i++){ const y = base - (base - top) * i / 5; x.beginPath(); x.moveTo(x0, y); x.lineTo(w - x0, y); x.stroke(); }
      let lvl = .45;
      for (let i = 0; i < n; i++){
        lvl = clamp(lvl + (r() - .45) * .18, .3, .95);
        const H = (base - top) * lvl, parts = [.34, .26, .22, .18].map(v => v * (.8 + r() * .4)), sum = parts.reduce((a, b) => a + b);
        let y = base;
        parts.forEach((v, k) => {
          const ph = H * v / sum, X = x0 + i * (bw + gap);
          if (k === 1){ x.fillStyle = `rgba(${RED_L},.9)`; x.fillRect(X, y - ph, bw, ph - 1.5); }
          else { x.strokeStyle = `rgba(${CH},${.35 + k * .12})`; x.lineWidth = 1; x.strokeRect(X + .5, y - ph + .5, bw - 1, ph - 2); if (k === 0){ for (let hy = y - 4; hy > y - ph + 2; hy -= 4){ x.beginPath(); x.moveTo(X + 2, hy); x.lineTo(X + bw - 2, hy); x.stroke(); } } }
          y -= ph;
        });
      }
      x.strokeStyle = `rgba(${P},.8)`; x.lineWidth = 1.2; x.beginPath(); x.moveTo(x0, base + .5); x.lineTo(w - x0, base + .5); x.stroke();
    },

    /* SACCO: isometric coin stacks; one stack outlined in red (a loan) */
    coins(x, w, h, r){
      x.fillStyle = '#e2dbcf'; x.fillRect(0, 0, w, h);
      const cols = 7, rx = w / (cols * 2.6), ry = rx * .34, th = ry * .55, base = h * .8;
      const hot = 2 + Math.floor(r() * 3);
      for (let c = 0; c < cols; c++){
        const cx = w * .1 + c * (w * .8 / (cols - 1)), n = 4 + Math.floor(r() * 14 + c * 1.6);
        const lift = (c % 2) * ry * 1.6;
        for (let k = 0; k < n; k++){
          const cy = base - lift - k * th;
          if (cy < h * .1) break;
          x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU);
          x.fillStyle = '#e2dbcf'; x.fill();
          x.strokeStyle = c === hot ? RED : `rgba(12,11,13,${.45 + (k === n - 1 ? .4 : 0)})`; x.lineWidth = c === hot ? 1.4 : .9; x.stroke();
          if (k === n - 1){ x.beginPath(); x.ellipse(cx, cy, rx * .62, ry * .62, 0, 0, TAU); x.stroke(); }
        }
      }
      x.strokeStyle = 'rgba(12,11,13,.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, base + ry * 2.4); x.lineTo(w, base + ry * 2.4); x.stroke();
    },

    /* Property: a block of flats; lit windows are occupied units, one in red */
    blocks(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const ground = h * .9;
      let X = -w * .02;
      while (X < w){
        const bw = w * (.14 + r() * .16), bh = h * (.38 + r() * .45), Y = ground - bh;
        x.fillStyle = INK; x.fillRect(X, Y, bw, bh);
        x.strokeStyle = `rgba(${CH},.55)`; x.lineWidth = 1; x.strokeRect(X + .5, Y + .5, bw - 1, bh);
        const wc = 3 + Math.floor(r() * 3), ww = bw / (wc * 1.8), wh = ww * 1.3;
        for (let yy = Y + wh; yy < ground - wh * 1.6; yy += wh * 1.9) for (let i = 0; i < wc; i++){
          const wx = X + bw * .12 + i * (bw * .76 / wc) + (bw * .76 / wc - ww) / 2, lit = r();
          if (lit > .985){ x.fillStyle = `rgba(${RED_L},.95)`; x.fillRect(wx, yy, ww, wh); }
          else if (lit > .45){ x.fillStyle = `rgba(${P},${.25 + r() * .55})`; x.fillRect(wx, yy, ww, wh); }
          else { x.strokeStyle = `rgba(${CH},.2)`; x.strokeRect(wx + .5, yy + .5, ww - 1, wh - 1); }
        }
        X += bw + w * .015;
      }
      x.strokeStyle = `rgba(${P},.8)`; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, ground); x.lineTo(w, ground); x.stroke();
    },

    /* Planning: a floor plan with door swings and an approval stamp */
    plan(x, w, h, r){
      x.fillStyle = '#e2dbcf'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(12,11,13,.07)'; x.lineWidth = 1;
      for (let gx = 0; gx < w; gx += w / 24){ x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, h); x.stroke(); }
      for (let gy = 0; gy < h; gy += w / 24){ x.beginPath(); x.moveTo(0, gy); x.lineTo(w, gy); x.stroke(); }
      const R = {x: w * .1, y: h * .14, w: w * .62, h: h * .72};
      const rooms = [R];
      for (let i = 0; i < 6; i++){
        const k = rooms.reduce((m, q, j) => q.w * q.h > rooms[m].w * rooms[m].h ? j : m, 0), q = rooms.splice(k, 1)[0];
        const t = .35 + r() * .3;
        if (q.w > q.h){ rooms.push({x: q.x, y: q.y, w: q.w * t, h: q.h}, {x: q.x + q.w * t, y: q.y, w: q.w * (1 - t), h: q.h}); }
        else { rooms.push({x: q.x, y: q.y, w: q.w, h: q.h * t}, {x: q.x, y: q.y + q.h * t, w: q.w, h: q.h * (1 - t)}); }
      }
      x.strokeStyle = INK; x.lineWidth = 1.4;
      rooms.forEach(q => {
        x.strokeRect(q.x, q.y, q.w, q.h);
        const d = Math.min(q.w, q.h) * .28;          // door swing
        x.fillStyle = '#e2dbcf'; x.fillRect(q.x + 2, q.y + q.h - 2.5, d, 5);
        x.lineWidth = .8; x.beginPath(); x.moveTo(q.x + 2, q.y + q.h); x.lineTo(q.x + 2, q.y + q.h - d); x.arc(q.x + 2, q.y + q.h, d, -Math.PI / 2, 0); x.stroke(); x.lineWidth = 1.4;
      });
      x.lineWidth = 4; x.strokeRect(R.x, R.y, R.w, R.h);
      // dimension line
      x.lineWidth = .8; x.strokeStyle = 'rgba(12,11,13,.6)';
      const dy = R.y + R.h + h * .05;
      x.beginPath(); x.moveTo(R.x, dy); x.lineTo(R.x + R.w, dy); x.moveTo(R.x, dy - 5); x.lineTo(R.x, dy + 5); x.moveTo(R.x + R.w, dy - 5); x.lineTo(R.x + R.w, dy + 5); x.stroke();
      // approval stamp
      const sx = w * .8, sy = h * .5, sr = Math.min(w, h) * .14;
      x.save(); x.translate(sx, sy); x.rotate(-.25);
      x.strokeStyle = RED; x.lineWidth = 2.4; x.beginPath(); x.arc(0, 0, sr, 0, TAU); x.stroke();
      x.lineWidth = 1; x.beginPath(); x.arc(0, 0, sr * .8, 0, TAU); x.stroke();
      x.fillStyle = RED; x.font = `700 ${sr * .26}px Archivo, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('APPROVED', 0, 0);
      x.restore();
    },

    /* Irrigation: drip lines over planted rows, and the soil-moisture trace */
    drip(x, w, h, r){
      x.fillStyle = '#e2dbcf'; x.fillRect(0, 0, w, h);
      const rows = 6, top = h * .12, bottom = h * .5;
      for (let i = 0; i < rows; i++){
        const y = top + (bottom - top) * i / (rows - 1);
        x.strokeStyle = 'rgba(12,11,13,.55)'; x.lineWidth = 1; x.beginPath(); x.moveTo(w * .04, y); x.lineTo(w * .84, y); x.stroke();
        for (let px = w * .07; px < w * .83; px += w * .06){
          x.beginPath(); x.arc(px, y + 6, 3.2 + r() * 2.2, 0, TAU); x.fillStyle = 'rgba(12,11,13,.75)'; x.fill();
          if (r() < .35){ x.beginPath(); x.moveTo(px + 10, y + 1); x.quadraticCurveTo(px + 13, y + 6, px + 10, y + 8); x.quadraticCurveTo(px + 7, y + 6, px + 10, y + 1); x.fillStyle = 'rgba(196,17,31,.7)'; x.fill(); }
        }
      }
      // moisture trace with a threshold; it dips, the pump runs, it recovers
      const g0 = h * .62, g1 = h * .86, th = g0 + (g1 - g0) * .62;
      x.strokeStyle = 'rgba(12,11,13,.2)'; x.lineWidth = 1; x.strokeRect(w * .04, g0, w * .92, g1 - g0);
      x.setLineDash([5, 4]); x.strokeStyle = RED; x.beginPath(); x.moveTo(w * .04, th); x.lineTo(w * .96, th); x.stroke(); x.setLineDash([]);
      x.strokeStyle = INK; x.lineWidth = 1.6; x.beginPath();
      let m = .25;
      for (let px = w * .04; px <= w * .96; px += 2){
        m += .006 + (r() - .5) * .006; if (m > .68) m = .22;
        const y = g0 + (g1 - g0) * m; px === w * .04 ? x.moveTo(px, y) : x.lineTo(px, y);
      }
      x.stroke();
    },

    /* Prototypes: an isometric enclosure in wireframe, hidden edges dashed */
    wire(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const s = Math.min(w, h) * .3, cx = w * .48, cy = h * .58;
      const iso = (a, b, c) => [cx + (a - b) * s * .866, cy + (a + b) * s * .5 - c * s];
      const W = 1.4, D = .9, H = .55;
      const V = [[0,0,0],[W,0,0],[W,D,0],[0,D,0],[0,0,H],[W,0,H],[W,D,H],[0,D,H]].map(p => iso(...p));
      const E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]], hidden = new Set(['2,3', '3,0', '3,7']);
      E.forEach(([a, b]) => { x.setLineDash(hidden.has(a + ',' + b) ? [4, 4] : []); x.strokeStyle = `rgba(${CH},${hidden.has(a + ',' + b) ? .35 : .85})`; x.lineWidth = 1.1; x.beginPath(); x.moveTo(...V[a]); x.lineTo(...V[b]); x.stroke(); });
      x.setLineDash([]);
      // board inside, mounting bosses, a cable gland
      const B = [[.15,.15,.12],[1.2,.15,.12],[1.2,.75,.12],[.15,.75,.12]].map(p => iso(...p));
      x.strokeStyle = `rgba(${RED_L},.95)`; x.lineWidth = 1.4; x.beginPath(); B.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.stroke();
      for (let i = 0; i < 9; i++){ const p = iso(.3 + r() * .8, .25 + r() * .4, .12); x.strokeRect(p[0] - 4, p[1] - 3, 8, 6); }
      [[.1,.1],[1.3,.1],[1.3,.8],[.1,.8]].forEach(([a, b]) => { const p = iso(a, b, 0), q = iso(a, b, .12); x.strokeStyle = `rgba(${CH},.6)`; x.lineWidth = 1; x.beginPath(); x.moveTo(...p); x.lineTo(...q); x.stroke(); });
      const g = iso(W, D * .5, H * .5); x.beginPath(); x.ellipse(g[0], g[1], s * .07, s * .1, -.5, 0, TAU); x.strokeStyle = `rgba(${CH},.85)`; x.stroke();
      // dimension
      const d0 = iso(0, -.25, 0), d1 = iso(W, -.25, 0);
      x.strokeStyle = `rgba(${CH},.5)`; x.lineWidth = .8; x.beginPath(); x.moveTo(...d0); x.lineTo(...d1); x.stroke();
      for (const d of [d0, d1]){ x.beginPath(); x.arc(d[0], d[1], 2, 0, TAU); x.fillStyle = `rgba(${CH},.8)`; x.fill(); }
    },

    /* Habit tracker: a contribution-style grid, seven weekday rows */
    habits(x, w, h, r){
      x.fillStyle = '#e2dbcf'; x.fillRect(0, 0, w, h);
      const weeks = 26, cell = Math.min((w * .76) / weeks, (h * .7) / 7), gap = cell * .2, s = cell - gap;
      const x0 = (w * .9 - weeks * cell) / 2, y0 = (h - 7 * cell) / 2 - h * .04, mask = [1, 1, 1, 1, 1, 0, 1];
      for (let d = 0; d < 7; d++) for (let k = 0; k < weeks; k++){
        const X = x0 + k * cell, Y = y0 + d * cell;
        if (!mask[d]){ x.strokeStyle = 'rgba(12,11,13,.18)'; x.lineWidth = 1; x.strokeRect(X + .5, Y + .5, s - 1, s - 1); continue; }
        const streak = .25 + .6 * (k / weeks), v = r();
        if (v < streak){ x.fillStyle = d === 2 ? `rgba(196,17,31,${.45 + r() * .5})` : `rgba(12,11,13,${.3 + r() * .65})`; x.fillRect(X, Y, s, s); }
        else { x.strokeStyle = 'rgba(12,11,13,.25)'; x.lineWidth = 1; x.strokeRect(X + .5, Y + .5, s - 1, s - 1); }
      }
      // the 7-bit mask, drawn as bits beside the grid
      x.fillStyle = INK; x.font = `600 ${cell * .55}px Archivo, sans-serif`; x.textAlign = 'right'; x.textBaseline = 'middle';
      mask.forEach((b, d) => x.fillText(String(b), x0 - cell * .4, y0 + d * cell + s / 2));
    },

    /* M-Pesa: receipt strips from the callback, one marked as failed */
    ticker(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const n = 5, sw = w * .12, gap = (w * .84 - n * sw) / (n + 1), bad = 1 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++){
        const X = gap + i * (sw + gap), Y = h * (.08 + r() * .12), H = h * (.55 + r() * .25), zz = sw / 8;
        x.beginPath(); x.moveTo(X, Y); x.lineTo(X + sw, Y); x.lineTo(X + sw, Y + H);
        for (let k = 8; k >= 0; k--) x.lineTo(X + k * zz, Y + H + (k % 2 ? zz * .8 : 0));
        x.closePath(); x.fillStyle = i === bad ? '#2a0307' : `rgba(${P},.92)`; x.fill();
        if (i === bad){ x.strokeStyle = `rgba(${RED_L},.95)`; x.lineWidth = 1.2; x.stroke(); }
        const ink = i === bad ? `rgba(${RED_L},.85)` : 'rgba(12,11,13,.7)';
        x.fillStyle = ink;
        for (let ly = Y + sw * .3; ly < Y + H - sw * .5; ly += sw * .16){ const lw = sw * (.3 + r() * .5); x.fillRect(X + sw * .12, ly, lw, 1.5); if (r() < .5) x.fillRect(X + sw * .88 - sw * .2, ly, sw * .2, 1.5); }
        x.fillRect(X + sw * .12, Y + H - sw * .42, sw * .76, 2.5);
        // tick or cross at the top
        x.strokeStyle = ink; x.lineWidth = 2; x.beginPath();
        const c = [X + sw / 2, Y + sw * .16];
        if (i === bad){ x.moveTo(c[0] - 5, c[1] - 5); x.lineTo(c[0] + 5, c[1] + 5); x.moveTo(c[0] + 5, c[1] - 5); x.lineTo(c[0] - 5, c[1] + 5); }
        else { x.moveTo(c[0] - 6, c[1]); x.lineTo(c[0] - 1, c[1] + 5); x.lineTo(c[0] + 7, c[1] - 6); }
        x.stroke();
      }
    },

    /* Homelab: circuit-board traces, vias and the Pi's 2x20 GPIO header */
    board(x, w, h, r){
      x.fillStyle = '#e2dbcf'; x.fillRect(0, 0, w, h);
      const g = Math.max(8, w / 46), snap = v => Math.round(v / g) * g;
      const chip = {x: snap(w * .38), y: snap(h * .3), w: snap(w * .22), h: snap(h * .32)};
      const pins = [];
      for (let k = 0; k < 20; k++) for (let j = 0; j < 2; j++) pins.push([snap(w * .08) + k * g * .9, snap(h * .84) + j * g * .9]);
      // traces from the chip to header pins, routed orthogonally
      const hot = Math.floor(r() * 20);
      for (let k = 0; k < 20; k++){
        const [px, py] = pins[k * 2], sx = chip.x + (k % 2 ? chip.w : 0), sy = chip.y + g + (k * g * .8) % (chip.h - g * 2);
        const mx = snap(sx + (k % 2 ? 1 : -1) * g * (1 + (k % 5)));
        x.strokeStyle = k === hot ? RED : 'rgba(12,11,13,.55)'; x.lineWidth = k === hot ? 2 : 1.2;
        x.beginPath(); x.moveTo(sx, sy); x.lineTo(mx, sy); x.lineTo(mx, py - g * 1.4); x.lineTo(px, py - g * 1.4); x.lineTo(px, py); x.stroke();
        x.beginPath(); x.arc(mx, sy, 2.6, 0, TAU); x.fillStyle = '#e2dbcf'; x.fill(); x.stroke();
      }
      // a few free traces to the edges
      for (let i = 0; i < 10; i++){
        const y = snap(h * (.08 + r() * .2)), x1 = snap(w * (.05 + r() * .3));
        x.strokeStyle = 'rgba(12,11,13,.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(x1, y); x.lineTo(x1 + snap(w * .2), y); x.lineTo(x1 + snap(w * .2) + g, y + g); x.stroke();
      }
      x.fillStyle = INK; x.fillRect(chip.x, chip.y, chip.w, chip.h);
      x.strokeStyle = `rgba(${P},.4)`; x.lineWidth = 1; x.strokeRect(chip.x + 4, chip.y + 4, chip.w - 8, chip.h - 8);
      pins.forEach(([px, py], i) => { x.fillStyle = Math.floor(i / 2) === hot ? RED : INK; x.fillRect(px - 2.5, py - 2.5, 5, 5); });
    },

    /* CV Maker: an editor beside its live preview */
    pages(x, w, h, r){
      x.fillStyle = INK; x.fillRect(0, 0, w, h);
      const pw = w * .32, ph = pw * 1.3, y = (h - ph) / 2 - h * .03, l = w * .12, rr = w * .56;
      // editor: labelled input boxes
      x.strokeStyle = `rgba(${CH},.6)`; x.lineWidth = 1; x.strokeRect(l, y, pw, ph);
      for (let k = 0, yy = y + ph * .08; k < 7; k++, yy += ph * .125){
        x.fillStyle = `rgba(${CH},.5)`; x.fillRect(l + pw * .08, yy, pw * (.18 + r() * .14), 2);
        x.strokeStyle = k === 2 ? `rgba(${RED_L},.95)` : `rgba(${CH},.4)`; x.strokeRect(l + pw * .08, yy + 6, pw * .84, ph * .055);
      }
      // preview: a typeset page
      x.fillStyle = `rgba(${P},.95)`; x.fillRect(rr, y, pw, ph);
      x.fillStyle = INK; x.fillRect(rr + pw * .1, y + ph * .08, pw * .5, 5);
      x.fillStyle = 'rgba(196,17,31,.9)'; x.fillRect(rr + pw * .1, y + ph * .08 + 10, pw * .3, 2);
      for (let k = 0, yy = y + ph * .2; yy < y + ph * .92; k++, yy += ph * .04){
        if (k % 6 === 0){ x.fillStyle = INK; x.fillRect(rr + pw * .1, yy, pw * .25, 2.5); continue; }
        x.fillStyle = 'rgba(12,11,13,.45)'; x.fillRect(rr + pw * .1, yy, pw * (.55 + r() * .25), 1.5);
      }
      // live link between them
      x.strokeStyle = `rgba(${RED_L},.9)`; x.lineWidth = 1.2; x.setLineDash([4, 4]);
      const a = [l + pw, y + ph * .08 + 6 + ph * .25 + ph * .03], b = [rr, y + ph * .3];
      x.beginPath(); x.moveTo(...a); x.bezierCurveTo(a[0] + w * .06, a[1], b[0] - w * .06, b[1], ...b); x.stroke(); x.setLineDash([]);
      x.beginPath(); x.moveTo(b[0] - 7, b[1] - 4); x.lineTo(b[0], b[1]); x.lineTo(b[0] - 7, b[1] + 4); x.stroke();
    },

    /* Quote page: halftone ripples spreading across the red */
    ripple(x, w, h, r){
      const s = w / 30, cx = w * .92, cy = h * .18;
      x.fillStyle = INK;
      let row = 0;
      for (let gy = s / 2; gy < h + s; gy += s, row++){
        for (let gx = row % 2 ? s : s / 2; gx < w + s; gx += s){
          const d = Math.hypot(gx - cx, gy - cy);
          // ripples live on the right; they fade out before the text column
          const fade = clamp((gx / w - .45) / .35, 0, 1);
          let v = (Math.sin(d / (w * .045)) * .5 + .5) * Math.max(0, 1 - d / (w * 1.1)) * fade;
          v *= .85 + r() * .3;
          const rad = s * .42 * Math.min(1, v);
          if (rad > .4){ x.beginPath(); x.arc(gx, gy, rad, 0, TAU); x.fill(); }
        }
      }
    }
  };


  window.PLATES = PLATES;
  window.PLATE_RNG = { rng, hash };
})();
