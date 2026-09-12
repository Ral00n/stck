import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const ssrEntry = path.join(root, "dist-ssr", "entry-server.js");

const { render, INGREDIENTS } = await import("file://" + ssrEntry);

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function writeRoute(routePath, appHtml, title, description) {
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeAttr(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeAttr(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeAttr(description)}" />`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  const outPath =
    routePath === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, routePath.replace(/^\//, ""), "index.html");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("prerendered:", routePath, "->", path.relative(root, outPath));
}

// Home page
writeRoute(
  "/",
  render("/"),
  "STCK — Evidence-Based Supplement Library",
  "An independent, evidence-based reference for 32 fitness and health supplements — mechanism, dosage, timing, benefits, cautions, and real research findings. No sponsored rankings, no affiliate links."
);

// One static page per ingredient
for (const item of INGREDIENTS) {
  const en = item.i18n.en;
  const title = `${en.name} — STCK`;
  const description = `${en.tagline} Evidence level: ${item.evidence}. Mechanism, dosage, timing, and real research findings for ${en.name}.`;
  writeRoute(`/ingredient/${item.id}`, render(`/ingredient/${item.id}`), title, description);
}

// Clean up the temporary SSR build — it's only needed at build time
fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });

// Regenerate sitemap.xml now that we know every real route
const siteUrl = "https://stck.info";
const urls = ["/", ...INGREDIENTS.map((i) => `/ingredient/${i.id}`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${siteUrl}${u}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${u === "/" ? "1.0" : "0.8"}</priority>\n  </url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);

console.log(`Prerendered ${INGREDIENTS.length + 1} pages.`);
