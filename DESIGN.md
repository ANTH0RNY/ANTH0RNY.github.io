# Design language

This is a portfolio that behaves like a printed magazine. Every section is a **page**, and scrolling **turns pages**. Nothing scrolls *inside* a page. The tone is restrained, editorial and high-contrast, with one loud element per page. The reference implementation is this repository; when this document and the code disagree, the code wins.

## Color

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0c0b0d` | Stage, dark pages, text on paper |
| `--paper` | `#efebe3` | Paper pages, text on dark and red |
| `--paper-2` | `#ded7cb` | Blank page backs |
| `--red` | `#c4111f` | Cover, Work opener, contact; accent on paper |
| `--red-deep` | `#5e0710` | Chapter openers, secondary red pages |
| `--chrome` | `#c9ccd1` | Metallic linework and chrome text |
| `--accent-l` | `#f0484d` | Red accent on dark backgrounds (passes contrast) |

Each page takes one theme class: `.paper`, `.dark`, `.red` or `.deep`. Alternate themes across a spread. Red is for openers and moments, never for long reading.

## Type

- **Display:** Bodoni Moda. Headlines mix roman and *italic* in one line ("Systems that are *safe to run*").
- **Body and labels:** Archivo. Ultra-condensed 900 (`font-stretch:62%`) is only for giant words such as **WORK**, **SYSTEMS** and **KCNA**.
- **Japanese accent:** Noto Serif JP 700, one meaningful kanji per page. The font is subset automatically to the kanji that are actually used.
- **Scale:** every size is a multiple of `--u`. A page is always about 100u tall.

| Step | Size |
|---|---|
| xs | 1.2u |
| s | 1.45u |
| body | 1.75u |
| m | 2.5u |
| l | 4.2u |
| xl | 6.6u |

## Page unit

`.face` is a size container, and `--u = min(1cqh, 1.389cqw) × --k`. `--k` is normally 1. The fit pass lowers it (to no less than 0.76) only when a page would otherwise overflow on a short screen. Content still has to be written to fit at `--k: 1`.

## Kanji used

| Page | Kanji | Reading |
|---|---|---|
| Cover | 作品集 | collected works |
| Contents | 目次 | contents |
| Preface | 序 | preface |
| Profile | 未来 | future |
| Experience | 経歴 | career |
| Languages | 言語 | language |
| Skills | 技術 | skill |
| Education | 学歴 | schooling |
| Work opener | 作品 | works |
| M365 collector | 監視 | monitoring |
| OT/PLC pilot | 制御 | control |
| vmware-automation | 仮想 | virtual |
| Construction system | 建設 | construction |
| EDMS | 文書 | documents |
| County system | 歳入 | revenue |
| SACCO system | 貯蓄 | savings |
| Property system | 住 | dwelling |
| Planning system | 計画 | plan |
| Event system | 催 | event |
| Plant disease | 葉 | leaf |
| Smart irrigation | 灌漑 | irrigation |
| Hardware prototypes | 試作 | prototype |
| Habit tracker | 習慣 | habit |
| M-Pesa Paybill | 決済 | payment |
| Homelab | 自宅 | home |
| CV Maker | 履歴書 | CV |
| Quote page | 言葉 | words |
| Personal chapter | 私 | personal |
| Systems chapter | 系統 | system |
| Bench chapter | 工房 | workshop |
| Contact | 連絡 | contact |
| Colophon | 奥付 | colophon |
| Back cover | 終 | end |
| 404 page | 迷 | lost |

## Page types (`content.js` → `render.js`)

- `cover`, `contents`, `letter`, `portrait`, `profile`: the opening pages.
- `experience`, `skills`, `education`: the career pages, built from hairline rows.
- `languages`: programming languages and tools as monochrome logos, plus spoken languages.
- `opener`: the red **WORK** page, with round buttons for the chapters.
- `chapter`: deep-red chapter openers, with a giant word and the chapter's project list.
- `single`: one project on one page (plate or photo, highlights, stack, specs). Every project uses it; keep each to about four highlights so it fits. `alt: true` puts the plate at the bottom.
- `quote`: a full-bleed breather page with one large quotation.
- `contact`, `colophon`, `back`.

## Plates

Plates are canvas drawings with a seeded RNG, so they look the same on every visit. They use ink, bone, chrome and red only. Every project page has one, matched to its subject:

| Plate | Used for | What it shows |
|---|---|---|
| `metrics` | M365 collector | Ridgelines, one per tenant |
| `network` | OT/PLC pilot | Switch-side topology |
| `clones` | vmware-automation | Golden template and clones |
| `contour` | Construction system | Survey contours with a site polygon |
| `tree` | EDMS | ltree folder hierarchy |
| `seats` | Event system | Auditorium of seats |
| photo | Plant disease | Real model output: segmented, labelled leaves (`assets/img/plant-segmentation.jpg`) |
| `ledger` | County system | Stacked monthly revenue bars |
| `coins` | SACCO system | Isometric coin stacks |
| `blocks` | Property system | Flats with lit, occupied units |
| `plan` | Planning system | Floor plan with an approval stamp |
| `drip` | Smart irrigation | Drip rows and a moisture trace |
| `wire` | Hardware prototypes | Wireframe enclosure |
| `habits` | Habit tracker | Weekday grid with the 7-bit mask |
| `ticker` | M-Pesa Paybill | Callback receipts |
| `board` | Homelab | PCB traces and the GPIO header |
| `pages` | CV Maker | Editor and live preview |
| `ripple` | Quote page | Halftone ripples |
| `halftone` | Cover | Halftone sun |
| `cables` | Portrait and back cover | Loose linework |

When real photography exists, it replaces a plate and keeps the same frame and caption: give the project `photo` (path) and `alt` (a description of what the image shows). The `leaf` plate stays in `plates.js` as a fallback.

A project can also carry an `inset` (`src`, `alt`, `cap`): a smaller photo tipped into the plate's corner with a paper border, captioned as Fig. *n*b.

## Textures

No page is a flat colour. Every page has a soft, blotchy tone (`--mottle`) and fine grain (`--noise`). It also has one pattern: `dots`, `lines`, `rings`, `grid` or `hatch`. The pattern is densest in one corner and fades across the page: `::before` is the light outer field, and `::after` is a tighter version near the corner. `render.js` picks the pattern and corner per page, so neighbouring pages never share a pattern. On project pages the pattern sits at the end away from the plate. Pages with a full-bleed drawing (cover, portrait, quote, back cover) stay plain. A page can choose its pattern with `tex: '<name>'`. Keep pattern ink faint (`--pat`, at most about 14% alpha) so text contrast holds.

## Logos

`assets/js/logos.js` holds monochrome marks from [Simple Icons](https://simpleicons.org) (CC0). They are filled with `currentColor`, so they take the page's ink; only the lead language (Python) is in the accent colour. Never use brand colours: they would break the one-accent rule. To add a tool, copy the `<path d>` of its Simple Icons SVG into `LOGOS` under its slug. A `null` slug renders the name in condensed type instead (used for SQL).

## Rules

Do:
- Give each page one loud thing and keep everything else quiet.
- Build hierarchy in this order: eyebrow → display title → italic deck → body.
- Use hairline rules to structure the page.
- Keep text contrast at 4.5:1 or better.

Don't:
- Use rounded cards, gradient washes, emoji or drop shadows on content.
- Use a generic sans, or any serif other than Bodoni.
- Scroll inside a page. Cut copy instead.
- Use more than one accent hue.
