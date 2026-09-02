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

The domain is already set to `stck.info` in `public/robots.txt` and `scripts/prerender.mjs`. If you ever change domains again, update those two files.

**Update:** this is now solved. `npm run build` runs three steps automatically:
1. `vite build` — builds the normal React app
2. `vite build --ssr src/entry-server.jsx` — builds a temporary server-rendering bundle
3. `node scripts/prerender.mjs` — renders every route (home + all 32 ingredients) to real static HTML files under `dist/ingredient/<id>/index.html`, each with its own unique `<title>` and meta description, then deletes the temporary SSR build and regenerates `sitemap.xml` with every URL

This means AI crawlers and search engines see fully-formed HTML with the actual ingredient content immediately — no JavaScript execution required. Real users still get the full interactive React app once the page loads (the static HTML is simply replaced by the live app on load).

The domain (`stck.info`) is already configured in `public/robots.txt` and `scripts/prerender.mjs` — no changes needed unless you switch domains later.

## Premium tab (monetization)

There's a "Premium" tab that sells a one-time digital guide via an external checkout link.

**Before this makes any money, you need to:**
1. Create a free account at [gumroad.com](https://gumroad.com) (or lemonsqueezy.com)
2. Create a digital product — e.g. a PDF guide — and upload it there
3. Copy your product's checkout link
4. In `src/App.jsx`, find this line (search for "your-product-here"):
   ```
   href="https://gumroad.com/l/your-product-here"
   ```
   and replace it with your real product link
5. Rebuild (`npm run build`) and redeploy

Gumroad/Lemon Squeezy handle all payment processing and automatically email the file to each buyer — fully passive once set up, no ongoing work per sale.

**Free PDF feature:** the Stack Builder tab also has a "Download PDF" button that generates a free, personalized summary (their selected ingredients, synergies, cautions, and schedule) entirely in the visitor's browser using the `jspdf` library — no server, no email required, works immediately.

## Content Admin Panel (post News without touching code)

There's now a **News** tab on the site, and a private admin panel at `/admin` where you write posts through a form — no code, no terminal, just like a Facebook post.

**How posting works once set up:** go to `yoursite.com/admin`, log in, click "New News Posts", fill in the title/date/category/summary/body, click "Publish". The site rebuilds itself automatically within a minute or two.

### One-time setup (you need to do these steps yourself — I can't log into your accounts for you)

**Step 1 — Put the code on GitHub** (skip if you already did the earlier GitHub steps)
1. Create a free account at https://github.com if you haven't already.
2. Click the "+" in the top right → "New repository". Name it anything (e.g. `know-your-stack`). Leave it Public or Private, either works. Don't add a README (we already have one).
3. On your computer, inside the `supplement-library` folder, run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
   (Replace YOUR_USERNAME/YOUR_REPO_NAME with what you see on the GitHub page after creating the repo — it shows you this exact command.)

**Step 2 — Connect Netlify to GitHub instead of drag-and-drop**
1. In Netlify, go to your site → Site settings → Build & deploy → "Link repository" (or create the site fresh via "Add new site" → "Import an existing project" → GitHub → pick your repo).
2. Netlify will auto-detect the build command and publish folder from `netlify.toml`. Click Deploy.
3. Now every `git push` (including ones made by the CMS itself) auto-redeploys your live site.

**Step 3 — Set up login via DecapBridge (replaces the old, discontinued Netlify Identity)**
1. Go to https://decapbridge.com and create a free account.
2. Create a new "Site", and link it to your GitHub repository from Step 1.
3. DecapBridge will show you a `backend:` configuration block. Copy it exactly.
4. Open `public/admin/config.yml` in your project and replace the placeholder `backend:` section at the top with what DecapBridge gave you. Leave everything below it (`media_folder`, `collections`, etc.) as is.
5. Commit and push this change (`git add . && git commit -m "Configure CMS auth" && git push`) — Netlify redeploys automatically.
6. In DecapBridge, invite yourself as a user (by email) — this is the login you'll use at `/admin`, no GitHub account needed for daily posting.

**Step 4 — Try it**
Go to `yoursite.com/admin`, log in with the email/password you set in DecapBridge, and publish a test post. Check the News tab on your live site a minute later.

### What this CMS can and can't do yet
- ✅ Create, edit, delete **News posts** — fully self-service, no code.
- ❌ Editing the 32-ingredient library or translations still requires code changes (a bigger, separate project if you want that later — ask anytime).
