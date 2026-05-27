# Gift Generator

A 3dxchat gift-message generator with live preview, code output, multi-language UI (EN/DE/FR/RU), and customizable templates.

By MissLarifari.
Live: https://sophey.vodka/gift-generator/

## Features

- **Live preview** with click-to-edit lines and reorder/remove controls
- **7 layouts** (Center, Inline, Compact, Framed, Minimal, Pyramid, Custom)
- **Per-line ★ star toggle** for Pyramid layout (Deco Top / Top Line / Bottom Line)
- **Themed template sections** — Sweet, Funny, Friends, Flirty, Dominant, Submissive, Flirty bold, Spicy, Voyeur, Aftercare, Funny / Chaotic, Friends / Roast, plus grouped **Vibes** (Goth / Dark, Drunk vibes, Soft / Cottagecore, Pride), **Holidays** (Christmas, Halloween, Easter, St Patricks, Valentine, Womens Day, 4th of July, Thanksgiving, Hanukkah, New Year), **Celebrations** (Wedding, Anniversary, Birthday)
- **Auto-theming** — clicking a holiday/celebration template applies matching colors and clears deco/kaomoji so the byte budget stays under the 240 chars / 255 bytes limit
- **Pride pastel rainbow** — main text gets a multi-color pastel gradient (capped at 3 segments to stay within the byte limit)
- **Favorites** — star any template to pin it to the top
- **Character + byte counter** with live warnings before you hit the 3dxchat limit
- **Light & dark theme**
- **Multi-language UI** — EN / DE / FR / RU

## Tech

Vanilla HTML/CSS/JS bundled by [Vite](https://vitejs.dev/). No framework, no backend, no tracking.

## Project structure

```
.
├── index.html              # Vite entry — the actual app
├── vite.config.js          # Vite config (base: '/gift-generator/')
├── package.json
├── package-lock.json
├── .gitignore
├── .env                    # DEPLOY_TOKEN (gitignored — never commit!)
├── .env.example            # Template for .env
├── README.md
│
├── public/                 # Static assets served as-is by Vite
│   ├── js/
│   │   ├── app.js          # Main app logic, i18n, theme functions
│   │   ├── templates.js    # Template sections + render
│   │   └── icons.js        # FontAwesome icon map + hydration
│   ├── css/
│   │   └── styles.css      # All styling (dark theme)
│   ├── img/
│   │   ├── gift.png        # Gift preview image
│   │   └── flags/          # UI language flags
│   ├── fontawesome/        # FA assets (self-hosted)
│   ├── favicon.svg
│   ├── _headers            # Netlify security headers
│   └── _redirects          # Netlify redirect to sophey.vodka
│
├── scripts/                # Local helper scripts
│   └── deploy.js           # Pushes to git + pings deploy webhook
│
├── alt-deploy/             # Alternative deployment options
│   └── netlify-redirect-only/   # Standalone Netlify "redirect-only" site
│       ├── index.html      # HTML fallback redirect
│       └── _redirects      # Netlify 301 redirect rule
│
└── dist/                   # Build output (gitignored, auto-generated)
```

## Local development

```bash
npm install
npm run dev
```

Opens http://localhost:5173 with hot-reload.

## Build for production

```bash
npm run build
```

Outputs to `dist/` ready for static hosting under `/gift-generator/`.

Test the production build locally:

```bash
npm run preview
```

## Deploy to sophey.vodka

1. Make sure `.env` contains a valid `DEPLOY_TOKEN` (ask your friend if you don't have one)
2. Commit your changes
3. Run:

```bash
npm run deploy
```

The script pushes to GitHub and pings the deploy webhook. The server then pulls, builds, and serves the new version.

## Alternative deploy (Netlify redirect-only)

Folder `alt-deploy/netlify-redirect-only/` contains a tiny standalone Netlify site that just redirects every request to `sophey.vodka/gift-generator/`. Useful as a backup if you want a barebones Netlify deploy that just hands traffic off to the main site.

Drag-drop that folder into a Netlify site to use it.

## Languages

UI is translated into English, Deutsch, Français and Русский. Templates stay in English. Add or edit translations in `public/app.js` (the `I18N` object).

<!-- git setup test -->
<!-- gcm-fix verified -->
<!-- final test commit -->
