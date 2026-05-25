# Gift Generator

A 3dxchat gift-message generator with live preview, code output, multi-language UI (EN/DE/FR/RU), and customizable templates.

Prototype — by MissLarifari.
Live: https://sophey.vodka/gift-generator/

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
│   ├── app.js              # Main app logic + i18n
│   ├── templates.js        # Template data + render
│   ├── styles.css          # All styling
│   ├── gift.png            # Gift image
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
