import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const SITE_URL = "https://trendinquirer.com";

const postsDir = "content/blog";
const distDir = "dist";
const blogOut = path.join(distDir, "blog");

fs.mkdirSync(blogOut, { recursive: true });

const postTpl = fs.readFileSync("templates/post.html", "utf8");
const homeTpl = fs.readFileSync("templates/home.html", "utf8");
const blogTpl = fs.readFileSync("templates/blog-index.html", "utf8");

const posts = [];

/* ---------- BUILD BLOG POSTS ---------- */
for (const file of fs.readdirSync(postsDir)) {
  if (!file.endsWith(".md")) continue;

  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data, content } = matter(raw);

  const html = postTpl
    .replace(/{{TITLE}}/g, data.title)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{SLUG}}/g, data.slug)
    .replace(/{{CONTENT}}/g, marked(content));

  const outPath = path.join(blogOut, `${data.slug}.html`);
  fs.writeFileSync(outPath, html);

  posts.push({
    title: data.title,
    slug: data.slug,
    description: data.description,
    lastmod: new Date().toISOString().split("T")[0],
    url: `${SITE_URL}/blog/${data.slug}.html`
  });
}

/* ---------- BUILD POST LIST ---------- */
const postListHTML = posts
  .slice()
  .reverse()
  .map(
    p => `
<li>
  <a href="/blog/${p.slug}.html"><strong>${p.title}</strong></a><br>
  <small>${p.description}</small>
</li>`
  )
  .join("\n");

/* ---------- BUILD HOMEPAGE ---------- */
fs.writeFileSync(
  path.join(distDir, "index.html"),
  homeTpl.replace("{{POST_LIST}}", postListHTML)
);

/* ---------- BUILD BLOG INDEX ---------- */
fs.writeFileSync(
  path.join(blogOut, "index.html"),
  blogTpl.replace("{{POST_LIST}}", postListHTML)
);

/* ---------- BUILD SITEMAP ---------- */
const sitemapUrls = [
  {
    loc: `${SITE_URL}/`,
    lastmod: new Date().toISOString().split("T")[0]
  },
  {
    loc: `${SITE_URL}/blog/`,
    lastmod: new Date().toISOString().split("T")[0]
  },
  ...posts.map(p => ({
    loc: p.url,
    lastmod: p.lastmod
  }))
];

const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
  )
  .join("")}
</urlset>`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXML);

console.log("✅ Dynamic homepage, blog & sitemap generated");
