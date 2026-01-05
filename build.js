import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const SITE_URL = "https://trendinquirer.com";

const postsDir = "content/blog";
const blogOut = "blog";

fs.mkdirSync(blogOut, { recursive: true });

const postTpl = fs.readFileSync("templates/post.html", "utf8");
const homeTpl = fs.readFileSync("templates/home.html", "utf8");
const blogTpl = fs.readFileSync("templates/blog-index.html", "utf8");

const posts = [];

/* -------- BUILD POSTS -------- */
for (const file of fs.readdirSync(postsDir)) {
  if (!file.endsWith(".md")) continue;

  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data, content } = matter(raw);

  const html = postTpl
    .replace(/{{TITLE}}/g, data.title)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{SLUG}}/g, data.slug)
    .replace(/{{CONTENT}}/g, marked(content));

  fs.writeFileSync(`blog/${data.slug}.html`, html);

  posts.push({
    title: data.title,
    slug: data.slug,
    description: data.description,
    url: `${SITE_URL}/blog/${data.slug}.html`,
    lastmod: new Date().toISOString().split("T")[0]
  });
}

/* -------- LIST HTML -------- */
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
  .join("");

/* -------- HOMEPAGE -------- */
fs.writeFileSync(
  "index.html",
  homeTpl.replace("{{POST_LIST}}", postListHTML)
);

/* -------- BLOG INDEX -------- */
fs.writeFileSync(
  "blog/index.html",
  blogTpl.replace("{{POST_LIST}}", postListHTML)
);

/* -------- SITEMAP -------- */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/blog/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  ${posts
    .map(
      p => `
  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
  </url>`
    )
    .join("")}
</urlset>`;

fs.writeFileSync("sitemap.xml", sitemap);

console.log("✅ Site built directly to root (Cloudflare-native)");
