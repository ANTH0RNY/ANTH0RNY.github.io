# anth0rny.github.io

Anthony Njeru's portfolio is built as a printed magazine: every section is a page, and scrolling turns the pages. It is a static site with no build step and no dependencies, served by GitHub Pages straight from `main`.

## Files

| Path | What it is |
|---|---|
| `assets/js/content.js` | **All the words.** Profile, experience, skills, the 17 projects, and the page order (`PAGES`). |
| `assets/js/render.js` | Turns `PAGES` into page templates, resolves page numbers and loads the kanji font subset. |
| `assets/js/plates.js` | The generative illustrations (seeded canvas drawings, one per project). |
| `assets/js/logos.js` | Monochrome language and tool logos from Simple Icons (CC0), used on the Languages page. |
| `assets/img/` | Real photos that replace a plate (currently the plant-disease model output). |
| `assets/js/book.js` | The page-flip engine, navigation, deep links and the fit-to-page safety net. |
| `assets/css/magazine.css` | The design system. Read [DESIGN.md](DESIGN.md) before changing it. |
| `index.html` | Shell: top bar, stage, section bar, `<noscript>` fallback. |
| `404.html` | Stand-alone "torn out" page. |
| `scripts/check-disclosure.sh` | Confidentiality check, run before every push. |

## Editing content

Change text in `content.js` and reload. Page numbers, the contents page, chapter lists and the section bar update themselves.

When adding or removing pages, **keep the page count even**, so the back cover closes the book (the console warns if it doesn't).

Every project is one page. Every page must fit in its frame: pages never scroll. If one is too long, cut the copy (about four highlights per project fits). The fit pass in `book.js` only scales a page down slightly on short screens.

## Preview locally

```sh
python -m http.server 8000
# open http://localhost:8000
```

Useful query flags while testing:
- `?audit` prints a JSON report of any page whose content overflows.
- `?still#m365` opens on a page without scrolling (for headless screenshots).
- `#<page-id>` (for example `#cms`) is a normal deep link to any page.

## Before you push: confidentiality

```sh
sh scripts/check-disclosure.sh
```

The script scans every file that would be published. It checks for:
- phone numbers and IP addresses
- leftover template text
- every term listed in `.disclosure-terms`

`.disclosure-terms` is a **git-ignored** local file. It holds the names that must never appear: the current employer, NDA codenames and the phone number. Keep it on your machine, and don't commit it, because that would publish the very names it protects.

Content rules:
- No phone number on the site.
- No current employer name; use "Managed service provider".
- No client, site or internal product names, except Trans Nzoia County, Nakuru County, MCB Technologies, Gearbox Industries and Regional Business Connection.
- Never use the Trans Nzoia system's codename.
- No invented links, metrics or screenshots.
- On the County, Nakuru, SACCO and property systems the role is **frontend developer only**.

## CV download

The CV button is hidden while `SITE.cv` is `null`.

1. Export a CV that passes the rules above. It must not name the employer, the OT client's facility or the County system's codename.
2. Save it as `cv/anthony-njeru-cv.pdf`. `.gitignore` blocks every other `*CV*.pdf`.
3. Set `cv: 'cv/anthony-njeru-cv.pdf'` in `content.js`.

## Deploy

Push to `main`. In the repository settings, Pages should be set to *Deploy from a branch*, `main`, `/ (root)`. `.nojekyll` tells GitHub Pages to serve the files as they are.
