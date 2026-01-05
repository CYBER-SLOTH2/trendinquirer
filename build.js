import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const postsDir = "content/blog";
const outDir = "dist/blog";
const template = fs.readFileSync("templates/post.html", "utf8");

fs.mkdirSync(outDir, { recursive: true });

for (const file of fs.readdirSync(postsDir)) {
  if (!file.endsWith(".md")) continue;

  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data, content } = matter(raw);

  const html = template
    .replace(/{{TITLE}}/g, data.title)
    .replace(/{{DESCRIPTION}}/g, data.description)
    .replace(/{{SLUG}}/g, data.slug)
    .replace(/{{CONTENT}}/g, marked(content));

  fs.writeFileSync(
    path.join(outDir, `${data.slug}.html`),
    html
  );
}

console.log("✅ Markdown converted to HTML successfully");
