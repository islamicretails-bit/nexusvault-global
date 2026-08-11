// src/app/sitemap.ts
import { NextResponse } from 'next/server';
import { getProducts } from '../lib/product';
import { getPages } from '../lib/page';
import { getBlogs } from '../lib/blog';

export async function GET() {
  const products = await getProducts();
  const pages = await getPages();
  const blogs = await getBlogs();

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map((page) => `
        <url>
          <loc>${page.url}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `).join('')}
      ${products.map((product) => `
        <url>
          <loc>${product.url}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `).join('')}
      ${blogs.map((blog) => `
        <url>
          <loc>${blog.url}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `).join('')}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

// src/lib/product.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  return products.map((product) => ({
    url: `/products/${product.slug}`,
  }));
}

// src/lib/page.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPages() {
  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  return pages.map((page) => ({
    url: `/${page.slug}`,
  }));
}

// src/lib/blog.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getBlogs() {
  const blogs = await prisma.blog.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  return blogs.map((blog) => ({
    url: `/blog/${blog.slug}`,
  }));
}

// prisma/schema.prisma
model Product {
  id       String   @id @default(cuid())
  title    String
  slug     String   @unique
  content  String
}

model Page {
  id       String   @id @default(cuid())
  title    String
  slug     String   @unique
  content  String
}

model Blog {
  id       String   @id @default(cuid())
  title    String
  slug     String   @unique
  content  String
}