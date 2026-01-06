import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import postFilter from "@/utils/postFilter";

function daysBetween(dateA: Date, dateB: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(Number(dateA) - Number(dateB)) / msPerDay);
}

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection("blog");

  // Static pages you want indexed on the site
  const staticPaths = [
    "/",
    "/about/",
    "/posts/",
    "/tags/",
    "/search/",
    "/archives/",
    "/privacy/",
    "/terms/",
  ];

  const urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq: string;
    priority: string;
  }> = [];

  // Add static pages
  for (const p of staticPaths) {
    urls.push({
      loc: new URL(p, site).href,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  // Add blog posts (filtered for publishable posts)
  const publicPosts = posts.filter(postFilter);

  for (const post of publicPosts) {
    const postPath = getPath(post.id, post.filePath, true);
    const lastmodDate = post.data.modDatetime ?? post.data.pubDatetime;
    const lastmod = new Date(lastmodDate).toISOString();

    // Choose changefreq/priority based on recency
    const ageDays = daysBetween(new Date(), new Date(lastmodDate));
    let changefreq = "monthly";
    let priority = "0.5";

    if (ageDays <= 7) {
      changefreq = "daily";
      priority = "0.8";
    } else if (ageDays <= 30) {
      changefreq = "weekly";
      priority = "0.7";
    }

    urls.push({
      loc: new URL(postPath, site).href,
      lastmod,
      changefreq,
      priority,
    });
  }

  // Build XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => {
      return `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`;
    })
    .join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
