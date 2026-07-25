import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aicareercopilot.com';

export async function GET() {
  const now = new Date().toISOString();

  const pages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/?tab=dashboard', changefreq: 'daily', priority: '0.9' },
    { url: '/?tab=agents', changefreq: 'monthly', priority: '0.7' },
    { url: '/?tab=search', changefreq: 'weekly', priority: '0.8' },
    { url: '/?tab=visa', changefreq: 'weekly', priority: '0.8' },
    { url: '/?tab=interview', changefreq: 'weekly', priority: '0.7' },
    { url: '/?tab=seo', changefreq: 'weekly', priority: '0.8' },
    { url: '/?tab=campaigns', changefreq: 'monthly', priority: '0.6' },
    { url: '/?tab=discoveries', changefreq: 'daily', priority: '0.7' },
    { url: '/?tab=analytics', changefreq: 'monthly', priority: '0.5' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
