# Know Your Stack — Supplement Library

## Run it locally
```
npm install
npm run dev
```
Then open the localhost link it prints (usually http://localhost:5173).

## Build for production
```
npm run build
```
This creates a `dist/` folder with the finished static site. `netlify.toml` is already configured with the right build command and publish folder.

## Deploy on Netlify — two ways

### Option A: Drag and drop (fastest, no GitHub needed)
1. Run `npm install` then `npm run build` locally (see above) — this creates the `dist/` folder.
2. Go to https://app.netlify.com and log in (or create a free account).
3. On your dashboard, find the "Deploys" area and drag the `dist` folder onto it.
4. Netlify uploads it and gives you a live link like `random-name-123.netlify.app` within seconds.
5. You can rename the site (Site settings -> Change site name) to get a nicer subdomain.

### Option B: Connect to GitHub (auto-deploys on every change)
1. Push this whole folder to a new GitHub repository.
2. In Netlify, click "Add new site" -> "Import an existing project" -> connect GitHub -> pick the repo.
3. Netlify auto-detects the build command (`npm run build`) and publish folder (`dist`) from `netlify.toml`.
4. Click Deploy. Every future `git push` automatically redeploys the live site.

## Add a custom domain
1. Buy a domain (Namecheap, Cloudflare Registrar, or Papaki/Grhost for .gr).
2. In Netlify: Site settings -> Domain management -> Add a domain.
3. Netlify shows you exactly which DNS records to add at your registrar (usually a CNAME or Netlify's own nameservers).
4. Free HTTPS (SSL certificate) is issued automatically once DNS is verified — usually within minutes to a few hours.

## AI / LLM discoverability (GEO)

This project includes basic AI-search-optimization files:
- `public/llms.txt` — a plain-language summary of the site for AI systems
- `public/robots.txt` — explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
- `public/sitemap.xml` — basic sitemap
- Meta description, Open Graph tags, and JSON-LD structured data in `index.html`

**Before deploying**, replace `https://your-domain-here.com` in `public/robots.txt` and `public/sitemap.xml` with your real domain once you have one.

**Update:** this is now solved. `npm run build` runs three steps automatically:
1. `vite build` — builds the normal React app
2. `vite build --ssr src/entry-server.jsx` — builds a temporary server-rendering bundle
3. `node scripts/prerender.mjs` — renders every route (home + all 32 ingredients) to real static HTML files under `dist/ingredient/<id>/index.html`, each with its own unique `<title>` and meta description, then deletes the temporary SSR build and regenerates `sitemap.xml` with every URL

This means AI crawlers and search engines see fully-formed HTML with the actual ingredient content immediately — no JavaScript execution required. Real users still get the full interactive React app once the page loads (the static HTML is simply replaced by the live app on load).

**Before deploying**, update the placeholder domain `https://your-domain-here.com` in two places:
- `public/robots.txt` (the `Sitemap:` line)
- `scripts/prerender.mjs` (the `siteUrl` constant, used to build `sitemap.xml`)
