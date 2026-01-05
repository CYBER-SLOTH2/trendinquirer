import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const postsDir = "content/blog";
const distDir = "dist";
const blogOut = path.join(distDir, "blog");

fs.mkdirSync(blogOut, { recursive: true });

const postTpl = fs.readFileSync("templates/post.html", "utf8");
const homeTpl = fs.readFileSync("templates/home.html", "utf8");
const blogTpl = fs.readFileSync("templates/blog-index.html", "utf8");

const posts = [];

for (const file of fs.readdirSync(postsDir)) {
  if (!file.endsWith(".md")) continue;

  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data, content } = matter(raw);

  const html = postTpl
    .replace(/{{TITLE}}/g, data.title)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{SLUG}}/g, data.slug)
    .replace(/{{CONTENT}}/g, marked(content));

  fs.writeFileSync(
    path.join(blogOut, `${data.slug}.html`),
    html
  );

  posts.push({
    title: data.title,
    slug: data.slug,
    description: data.description
  });
}

/* Build post list */
const postListHTML = posts
  .reverse()
  .map(
    p =>
      `<li>
        <a href="/blog/${p.slug}.html"><strong>${p.title}</strong></a><br>
        <small>${p.description}</small>
      </li>`
  )
  .join("\n");

/* Homepage */
fs.writeFileSync(
  path.join(distDir, "index.html"),
  homeTpl.replace("{{POST_LIST}}", postListHTML)
);

/* Blog index */
fs.writeFileSync(
  path.join(blogOut, "index.html"),
  blogTpl.replace("{{POST_LIST}}", postListHTML)
);

console.log("✅ Dynamic homepage & blog generated");
