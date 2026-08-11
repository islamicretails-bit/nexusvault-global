// src/lib/seo-generator.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { SEOData } from '../types/index';

const prisma = new PrismaClient();

interface SEOGeneratorOptions {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image: string;
}

class SEOGenerator {
  private options: SEOGeneratorOptions;

  constructor(options: SEOGeneratorOptions) {
    this.options = options;
  }

  async generateSEOData(): Promise<SEOData> {
    const { title, description, keywords, url, image } = this.options;

    const seoData: SEOData = {
      title,
      description,
      keywords,
      url,
      image,
      openGraph: {
        title,
        description,
        url,
        image,
        type: 'website',
      },
      schemaOrg: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url,
        image,
      },
    };

    return seoData;
  }

  async saveSEOData(seoData: SEOData): Promise<void> {
    await prisma.seoData.create({
      data: {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords.join(','),
        url: seoData.url,
        image: seoData.image,
        openGraph: JSON.stringify(seoData.openGraph),
        schemaOrg: JSON.stringify(seoData.schemaOrg),
      },
    });
  }
}

export const generateSEO = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, description, keywords, url, image } = req.body;

  if (!title || !description || !keywords || !url || !image) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  const seoGenerator = new SEOGenerator({
    title,
    description,
    keywords: keywords.split(','),
    url,
    image,
  });

  const seoData = await seoGenerator.generateSEOData();
  await seoGenerator.saveSEOData(seoData);

  return res.status(201).json(seoData);
};