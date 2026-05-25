# Gift Generator

A 3dxchat gift-message generator with live preview, code output, multi-language UI (EN/DE/FR/RU), and customizable templates.

Prototype — by MissLarifari.

## Tech

Vanilla HTML/CSS/JS bundled by [Vite](https://vitejs.dev/). No framework, no backend, no tracking.

## Project structure

```
.
├── index.html          # Vite entry — the actual app
├── public/             # Static assets served as-is
│   ├── app.js          # Main app logic
│   ├── templates.js    # Template data + render
│   ├── styles.css      # All styling
│   ├── gift.png        # Gift image
│   ├── _headers        # Netlify security headers
│   └── _redirects      # Netlify redirect
├── package.json
├── vite.config.js      # base: '/gift-generator/'
├── deploy.js           # Pushes to git + pings deploy webhook
├── .env                # DEPLOY_TOKEN (gitignored — never commit!)
└── .env.example        # Template for .env
```

## Local development

```bash
npm install
npm run dev
```

Opens http://localhost:5173 with hot-reload.

## Build

```bash
npm run build
```

Outputs to `dist/` ready for static hosting under `/gift-generator/`.

## Deploy to sophey.vodka

1. Make sure your `.env` contains a valid `DEPLOY_TOKEN`
2. Commit your changes
3. Run:

```bash
npm run deploy
```

The script pushes to GitHub and pings the deploy webhook. The server then pulls, builds, and serves the new version.

## Languages

UI is translated into English, Deutsch, Français and Русский. Templates stay in English. Add or edit translations in `public/app.js` (the `I18N` object).
