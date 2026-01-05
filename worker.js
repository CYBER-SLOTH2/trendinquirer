const posts = [
  {
    slug: "hello-ai-world",
    title: "Hello AI World",
    description: "AI-powered auto blog built on Cloudflare Workers",
    content: "<p>This is an SEO-optimized auto blog served from Cloudflare Workers.</p>",
    date: "2026-01-05"
  }
];

function layout(title, description, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://example.com/">
</head>
<body>
<header><h1>${title}</h1></header>
<main>${body}</main>
<footer><p>© 2026 Auto Blog</p></footer>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const list = posts.map(p =>
        `<article><h2><a href="/blog/${p.slug}">${p.title}</a></h2><p>${p.description}</p></article>`
      ).join("");
      return new Response(layout(
        "Auto Blog",
        "AI-powered auto blog for maximum Google ranking and AdSense earnings",
        list
      ), { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    if (url.pathname.startsWith("/blog/")) {
      const slug = url.pathname.split("/").pop();
      const post = posts.find(p => p.slug === slug);
      if (!post) return new Response("Not Found", { status: 404 });

      return new Response(layout(
        post.title,
        post.description,
        `<article><p><small>${post.date}</small></p>${post.content}</article>`
      ), { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    if (url.pathname === "/robots.txt") {
      return new Response(
        "User-agent: *\nAllow: /",
        { headers: { "content-type": "text/plain" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};