/* Renders PAGES (content.js) into <template class="src"> elements that book.js turns into a book. */
(() => {
  const { SITE, PAGES, PROJECTS: PR, CHAPTERS, COPY: C } = window;
  const pad = n => String(n).padStart(2, '0');
  const ids = PAGES.map(p => p.id);
  const at = id => { const i = ids.indexOf(id); if (i < 0) console.warn('Unknown page id', id); return i; };
  const no = id => pad(at(id) + 1);
  const pageOf = key => PAGES.findIndex(p => p.project === key || (p.items || []).includes(key));
  const strip = s => s.replace(/<[^>]+>/g, '');

  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const COPYI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/></svg>';
  const DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>';
  const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>';

  const runhead = (left, kanji) => `<div class="runhead"><span>${left}</span><span class="kanji" aria-hidden="true">${kanji}</span></div>`;
  const ghost = (k, style) => `<div class="ghost-k" aria-hidden="true" style="${style}">${k}</div>`;
  const cvBtn = () => SITE.cv ? `<a class="btn" href="${SITE.cv}" download>${DOWN}<span>Download CV</span></a>` : '';
  const ext = (url, label) => `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;

  /* plates drawn on a light ground get dark captions */
  const LIGHT = ['contour', 'clones', 'coins', 'plan', 'drip', 'habits', 'board']; // keep in sync with plates.js
  /* a real photo, when there is one, takes the plate's place in the same frame */
  const plateWrap = (pr) => pr.photo ? `
    <figure class="plate-wrap photo">
      <img class="plate" src="${pr.photo}" alt="${pr.alt}" loading="lazy" decoding="async">
      <span class="plate-k kanji" aria-hidden="true">${pr.kanji}</span>
      ${pr.inset ? `<figure class="inset"><img src="${pr.inset.src}" alt="${pr.inset.alt}" loading="lazy" decoding="async"><figcaption>Fig. ${pr.n}b · ${pr.inset.cap}</figcaption></figure>` : ''}
      <figcaption class="plate-cap">Fig. ${pr.n} · ${pr.cap}</figcaption>
    </figure>` : `
    <div class="plate-wrap${LIGHT.includes(pr.plate) ? ' light' : ''}">
      <canvas class="plate" data-plate="${pr.plate}" aria-hidden="true"></canvas>
      <span class="plate-k kanji" aria-hidden="true">${pr.kanji}</span>
      <span class="plate-cap">Fig. ${pr.n} · ${pr.cap}</span>
    </div>`;
  /* brand-coloured logo; light brand colours get an ink tile so they stay visible on paper */
  const logo = (slug, name) => {
    if (!window.LOGOS || !window.LOGOS[slug]) return `<span class="logo logo-type" aria-hidden="true">${name}</span>`;
    const color = (window.LOGO_COLORS || {})[slug] || 'currentColor';
    const ink = (window.LOGO_ON_INK || []).includes(slug);
    return ink
      ? `<svg class="logo" viewBox="-4 -4 32 32" style="color:${color}" aria-hidden="true"><rect x="-4" y="-4" width="32" height="32" fill="#0c0b0d"/><path d="${window.LOGOS[slug]}"/></svg>`
      : `<svg class="logo" viewBox="0 0 24 24" style="color:${color}" aria-hidden="true"><path d="${window.LOGOS[slug]}"/></svg>`;
  };
  const projHead = (pr, tag = 'h3') => `
    <div class="proj-head"><span class="proj-n outline" aria-hidden="true">${pr.n}</span><div><p class="eyebrow acc">${pr.eyebrow}</p><${tag} class="proj-t display">${pr.title}</${tag}></div></div>`;
  const specs = pr => `<dl class="specs">${pr.specs.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>`;
  const hl = list => list.length ? `<ol class="hl">${list.map(h => `<li><span>${h}</span></li>`).join('')}</ol>` : '';

  const R = {
    cover: () => `
      <div class="pg red cover">
        <canvas class="plate" data-plate="halftone" aria-hidden="true"></canvas>
        <div class="cover-top eyebrow"><span>${SITE.issue} · ${SITE.date}</span><span>${C.cover.top[0]}</span></div>
        <h1 class="masthead" data-fit><span class="sr-only">Anthony </span>${SITE.masthead}</h1>
        <p class="cover-role eyebrow">${SITE.role} · ${SITE.location}</p>
        <div class="cover-kanji kanji" aria-hidden="true">作品集</div>
        <div class="cover-bottom">
          <div class="coverlines">
            <p class="cl-big display">${C.cover.lineBig}</p>
            <p class="cl">${C.cover.line}</p>
            <p class="cl"><b>Inside</b>${C.cover.inside}</p>
          </div>
          <div>
            <div class="issue"><span class="eyebrow">No.</span><span class="display">${SITE.issue.replace(/\D/g, '')}</span></div>
            <div class="barcode" data-barcode="1"></div>
          </div>
        </div>
      </div>`,

    contents: () => {
      const rows = [
        ['preface', 'Preface', 'From circuits to systems'],
        ['portrait', 'The Profile', `${SITE.name}, ${SITE.location}`],
        ['experience', 'Experience', 'Four roles, 2022 to now'],
        ['languages', 'Skills', 'Languages, tools and the full kit'],
        ['education', 'Education', 'JKUAT, Lenana School and KCNA'],
        ['work', 'Selected Work', 'Seventeen projects in four chapters', true],
        ['contact', 'Contact', 'Email, GitHub and LinkedIn']
      ];
      return `
      <div class="pg paper" data-folio>
        ${runhead('Contents', '目次')}
        <h2 class="title display"><em>In this</em> issue</h2>
        <ol class="toc">
          ${rows.map(([id, t, d, sub]) => `
          <li><button class="toc-link" data-goto="${at(id)}"><span class="toc-n">${no(id)}</span><span><span class="toc-t">${t}</span><span class="toc-d">${d}</span></span>${ARROW}</button>
            ${sub ? `<div class="toc-sub">${CHAPTERS.map(c => `<button class="chip" data-goto="${at(c.first)}"><b>${no(c.first)}</b>${c.short}</button>`).join('')}</div>` : ''}
          </li>`).join('')}
        </ol>
      </div>`;
    },

    letter: () => `
      <div class="pg paper" data-folio>
        ${ghost(C.letter.kanji, 'right:-4%;bottom:8%;font-size:calc(var(--u)*40)')}
        ${runhead(C.letter.head, C.letter.kanji)}
        <h2 class="title display">${C.letter.title}</h2>
        <div class="letter-body">${C.letter.body.map((p, i) => `<p${i ? '' : ' class="dropcap"'}>${p}</p>`).join('')}</div>
        <div class="sig"><p class="display">${SITE.name}</p><p class="eyebrow mute" style="margin-top:.6em">${SITE.role}</p></div>
      </div>`,

    portrait: () => `
      <div class="pg dark" data-folio>
        <canvas class="plate" data-plate="cables" aria-hidden="true"></canvas>
        <div class="mirai kanji" data-k="未来" aria-hidden="true">未来</div>
        <span class="edge-v" aria-hidden="true">Profile · Future</span>
        <div class="portrait-meta">
          <p class="eyebrow acc">The Profile</p>
          <h2 class="name">${SITE.name.replace(' ', '<br>')}</h2>
          <p class="eyebrow">${SITE.role}</p>
          <dl class="meta3">${C.portrait.meta.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
        </div>
      </div>`,

    profile: () => `
      <div class="pg paper" data-folio>
        ${runhead(C.profile.head, C.profile.kanji)}
        <h2 class="title display">${C.profile.title}</h2>
        <p class="deck">${C.profile.deck}</p>
        <p class="pull">${C.profile.pull}</p>
        <div class="cols">${C.profile.themes.map(([t, d]) => `<p><b class="lead-in">${t}.</b> ${d}</p>`).join('')}</div>
      </div>`,

    experience: () => `
      <div class="pg dark" data-folio>
        ${runhead(C.experience.head, C.experience.kanji)}
        <h2 class="title title-s display">${C.experience.title}</h2>
        <ol class="roles">
          ${C.experience.roles.map(r => `
          <li>
            <p class="r-period">${r.period}${r.where ? `<span class="r-where">${r.where}</span>` : ''}</p>
            <div>
              <h3 class="r-role display">${r.role}</h3>
              <p class="eyebrow acc r-org">${r.org}</p>
              <ul class="r-pts">${r.points.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
          </li>`).join('')}
        </ol>
      </div>`,

    languages: pg => {
      const L = C.languages;
      return `
      <div class="pg ${pg.theme}" data-folio>
        ${runhead(L.head, L.kanji)}
        <h2 class="title display">${L.title}</h2>
        <p class="eyebrow acc lang-label">Programming languages</p>
        <ul class="langs">${L.code.map(([slug, name, use]) => `
          <li>${logo(slug, name)}<span class="lang-n display">${name}</span><span class="lang-u">${use}</span></li>`).join('')}
        </ul>
        <p class="eyebrow acc lang-label">Tools I reach for</p>
        <ul class="tools">${L.tools.map(([slug, name]) => `<li>${logo(slug, name)}<span>${name}</span></li>`).join('')}</ul>
        <div class="spoken">
          <p class="eyebrow acc">Spoken</p>
          <dl>${L.spoken.map(([t, d]) => `<div><dt class="display">${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
        </div>
      </div>`;
    },

    skills: pg => `
      <div class="pg ${pg.theme}" data-folio>
        ${ghost(C.skills.kanji.slice(1), 'right:-6%;bottom:6%;font-size:calc(var(--u)*40);opacity:.07')}
        ${runhead(C.skills.head, C.skills.kanji)}
        <h2 class="title display">${C.skills.title}</h2>
        <dl class="skillrows">${C.skills.groups.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
      </div>`,

    education: () => `
      <div class="pg paper" data-folio>
        ${ghost(C.education.kanji.slice(0, 1), 'right:-6%;top:18%;font-size:calc(var(--u)*44)')}
        ${runhead(C.education.head, C.education.kanji)}
        <h2 class="title display">${C.education.title}</h2>
        <ol class="roles edu">
          ${C.education.items.map(e => `
          <li>
            <p class="r-period">${e.period}</p>
            <div>
              <h3 class="r-role display">${e.title}</h3>
              <p class="eyebrow acc r-org">${e.org}</p>
              <p class="r-note">${e.note}${e.goto ? ` <button class="inline-link" data-goto="${at(e.goto)}">See p. ${no(e.goto)}</button>` : ''}</p>
            </div>
          </li>`).join('')}
        </ol>
        <div class="cert">
          <p class="eyebrow acc">Certification</p>
          ${C.education.certs.map(c => `
          <div class="cert-row">
            <span class="cert-abbr outline" aria-hidden="true">${c.abbr}</span>
            <div><h3 class="r-role display">${c.title} <span class="sr-only">(${c.abbr})</span></h3><p class="eyebrow mute">${c.org}</p></div>
          </div>`).join('')}
        </div>
      </div>`,

    opener: () => {
      // chapter stats: project count, share of the biggest chapter, first page
      const most = Math.max(...CHAPTERS.map(c => c.items.length));
      return `
      <div class="pg red opener-pg" data-folio>
        ${ghost('作品', 'right:-6%;top:6%;font-size:calc(var(--u)*34);opacity:.12;color:var(--ink)')}
        ${runhead('Section 04', '作品')}
        <div style="margin-top:auto">
          <p class="wt-small">${C.opener.small}</p>
          <h2 class="wt-big" data-fit>${C.opener.word}</h2>
          <p class="opener-deck display">${C.opener.deck}</p>
          <p class="eyebrow stats-head">Projects per chapter</p>
          <ol class="stats">
            ${CHAPTERS.map(c => `
            <li><button class="stat" data-goto="${at(c.first)}" aria-label="Chapter ${c.n}, ${c.name}: ${c.items.length} projects, from page ${no(c.first)}">
              <span class="stat-n display">${pad(c.items.length)}</span>
              <span class="stat-l">${c.short}</span>
              <span class="stat-bar" aria-hidden="true"><i style="--w:${(c.items.length / most).toFixed(3)}"></i></span>
              <span class="stat-c">p. ${no(c.first)} ${ARROW}</span>
            </button></li>`).join('')}
          </ol>
          <p class="eyebrow">Chapter 01 · ${CHAPTERS[0].name} · next page</p>
        </div>
      </div>`;
    },

    chapter: pg => {
      const c = CHAPTERS[pg.chapter];
      const k = ['系統', '系統', '工房', '私'][pg.chapter];
      return `
      <div class="pg ${pg.theme}" data-folio>
        ${ghost(k.slice(0, 1), 'right:-8%;top:4%;font-size:calc(var(--u)*46);opacity:.1')}
        ${runhead('Chapter ' + c.n, k)}
        <div style="margin-top:auto">
          <p class="wt-small">Chapter ${c.n}</p>
          <h2 class="wt-big" data-fit>${pg.word}</h2>
          <p class="opener-deck display"><em>${pg.deck || c.name}</em></p>
          <ol class="toc chapter-toc">
            ${c.items.map(key => { const i = pageOf(key); return `
            <li><button class="toc-link" data-goto="${i}"><span class="toc-n">${pad(i + 1)}</span><span><span class="toc-t">${PR[key].plain}</span></span>${ARROW}</button></li>`; }).join('')}
          </ol>
        </div>
      </div>`;
    },

    single: pg => {
      const pr = PR[pg.project];
      return `
      <div class="pg ${pg.theme} project single${pg.alt ? ' alt' : ''}" data-folio>
        ${plateWrap(pr)}
        <div class="proj-body">
          ${projHead(pr, 'h2')}
          <p class="proj-deck">${pr.deck}</p>
          ${hl(pr.highlights)}
          <p class="n-stack"><b class="eyebrow acc">Stack</b> ${pr.stack.join(' · ')}</p>
          ${specs(pr)}
        </div>
      </div>`;
    },

    quote: () => `
      <div class="pg red quote" data-folio>
        <canvas class="plate" data-plate="ripple" aria-hidden="true"></canvas>
        ${runhead('In my own words', '言葉')}
        <blockquote class="q-text display">
          <p>${C.quote.text}</p>
          <footer class="eyebrow">${C.quote.by}</footer>
        </blockquote>
      </div>`,

    contact: () => `
      <div class="pg red" data-folio>
        ${runhead(C.contact.head, C.contact.kanji)}
        <h2 class="booking display">${C.contact.title}</h2>
        <p class="lead">${C.contact.lead}</p>
        <div class="email-row">
          <a class="email" href="mailto:${SITE.email}" data-fit>${SITE.email}</a>
          <button class="btn" data-copy="${SITE.email}">${COPYI}<span>Copy address</span></button>
        </div>
        <dl class="grid3">
          <div><dt>GitHub</dt><dd>${ext(SITE.github.url, SITE.github.label)}</dd></div>
          <div><dt>LinkedIn</dt><dd>${ext(SITE.linkedin.url, SITE.altName)}</dd></div>
          <div><dt>Website</dt><dd>${SITE.website}</dd></div>
          <div><dt>Based in</dt><dd>${SITE.location}</dd></div>
          <div><dt>Languages</dt><dd>English · Kiswahili</dd></div>
          ${SITE.cv ? `<div><dt>CV</dt><dd><a href="${SITE.cv}" download>Download PDF</a></dd></div>` : ''}
        </dl>
        ${cvBtn() ? `<div>${cvBtn()}</div>` : ''}
      </div>`,

    colophon: () => `
      <div class="pg paper" data-folio>
        ${runhead(C.colophon.head, C.colophon.kanji)}
        <div class="okuzuke kanji" aria-hidden="true">${C.colophon.kanji}</div>
        <h2 class="title display">Colophon</h2>
        <dl class="colo">${C.colophon.rows.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>
        <p class="thanks display">Thank you for reading.</p>
      </div>`,

    back: () => `
      <div class="pg dark backcover">
        <canvas class="plate" data-plate="cables" aria-hidden="true" style="opacity:.6"></canvas>
        <div class="bc-k kanji" aria-hidden="true">終</div>
        <p class="bc-mast" data-fit>${SITE.masthead}</p>
        <p class="bc-tag">${C.back.tag}</p>
        <button class="btn" data-goto="0">${BACK}<span>Back to the cover</span></button>
        <div class="bc-foot">
          <p class="eyebrow mute">${SITE.issue} · ${SITE.date}<br>${SITE.location}</p>
          <div class="barcode" data-barcode="${PAGES.length}"></div>
        </div>
      </div>`
  };

  if (PAGES.length % 2) console.warn('PAGES has an odd count; the back cover will not close the book cleanly.');

  /* Background texture: a pattern that is densest in one corner (see magazine.css).
     Pages with a full-bleed drawing keep it plain. Neighbouring pages never share a
     pattern, and the corner moves around the book. On project pages it sits at the
     end away from the plate. A page can override with `tex: 'dots'` etc. */
  const TEX = ['dots', 'lines', 'rings', 'grid', 'hatch'];
  const CORNERS = [['100%', '100%'], ['0%', '0%'], ['100%', '0%'], ['0%', '100%']];
  const FULL = ['cover', 'portrait', 'quote', 'back'];
  const texture = (pg, i) => {
    if (FULL.includes(pg.type)) return { tex: 'none' };
    let [tx, ty] = CORNERS[i % 4];
    if (pg.type === 'single') ty = pg.alt ? '0%' : '100%';
    return { tex: pg.tex || TEX[i % TEX.length], tx, ty };
  };

  const frag = document.createDocumentFragment();
  PAGES.forEach((pg, i) => {
    const t = document.createElement('template');
    t.className = 'src';
    t.dataset.section = pg.section;
    t.dataset.id = pg.id;
    t.innerHTML = R[pg.type](pg).trim();
    const root = t.content.firstElementChild, x = texture(pg, i);
    root.dataset.tex = x.tex;
    if (x.tx){ root.style.setProperty('--tx', x.tx); root.style.setProperty('--ty', x.ty); }
    frag.appendChild(t);
  });
  document.body.appendChild(frag);

  /* Japanese accent font, subset to exactly the kanji used. */
  const txt = [...document.querySelectorAll('template.src')].map(t => t.innerHTML).join('');
  const kanji = [...new Set(txt.match(/[　-鿿]/g) || [])].join('');
  if (kanji){
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&display=swap&text=' + encodeURIComponent(kanji);
    document.head.appendChild(l);
  }
  window.PAGE_TITLES = PAGES.map(p => p.project ? strip(PR[p.project].plain) : p.head || p.id);
})();
