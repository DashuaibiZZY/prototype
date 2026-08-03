# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static HTML prototype collection** (a Chinese-language perpetual DEX / crypto exchange UI mockup). There is no build system, package manager, tests, or backend — every page is a self-contained `.html` file.

- **Entry point:** `index.html` at the repo root is a catalog page linking to the prototype sections (`nft/`, `whitelist/`, `perp_dex/app/`, `perp_dex/admin/`).
- **Run it:** serve the repo root over HTTP and open pages in a browser. Any static file server works, e.g. `python3 -m http.server 8000` from `/workspace`, then browse `http://localhost:8000/index.html`. Do not open files via `file://` — several pages use relative asset paths and links that expect an HTTP root.
- **Non-ASCII filenames:** many pages have Chinese filenames (e.g. `perp_dex/app/首页.html`). URL-encode them or quote them in shell/curl. They serve fine over `http.server`.
- **External CDN dependency:** pages pull Tailwind, Iconify, and ECharts from `https://modao.cc/agent-py/static/...`. Full styling/icons require outbound network access to that host. Inline page JavaScript (button handlers, modals, alerts) works regardless of CDN availability.
- **No lint/test/build:** there are no automated checks. "Testing" a change means loading the affected page in a browser and exercising its interactions.
- **Known dead link:** `index.html` references `perp_dex/perp_index.html`, which does not exist in the repo. Individual prototype pages under `perp_dex/app/` and `perp_dex/admin/` open directly.
