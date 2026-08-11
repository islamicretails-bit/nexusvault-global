// src/lib/seo-generator.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { OpenGraphMetadata, SchemaOrgMetadata } from '../types/index';

const prisma = new PrismaClient();

interface SeoGeneratorOptions {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image: string;
  type: string;
}

class SeoGenerator {
  private options: SeoGeneratorOptions;

  constructor(options: SeoGeneratorOptions) {
    this.options = options;
  }

  async generateOpenGraphMetadata(): Promise<OpenGraphMetadata> {
    const metadata: OpenGraphMetadata = {
      title: this.options.title,
      description: this.options.description,
      url: this.options.url,
      image: this.options.image,
      type: this.options.type,
    };

    return metadata;
  }

  async generateSchemaOrgMetadata(): Promise<SchemaOrgMetadata> {
    const metadata: SchemaOrgMetadata = {
      '@context': 'https://schema.org',
      '@type': this.options.type,
      name: this.options.title,
      description: this.options.description,
      url: this.options.url,
      image: this.options.image,
    };

    return metadata;
  }

  async generateSeoMetadata(): Promise<{ openGraph: OpenGraphMetadata; schemaOrg: SchemaOrgMetadata }> {
    const openGraphMetadata = await this.generateOpenGraphMetadata();
    const schemaOrgMetadata = await this.generateSchemaOrgMetadata();

    return { openGraph: openGraphMetadata, schemaOrg: schemaOrgMetadata };
  }
}

export const getSeoMetadata = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, description, keywords, url, image, type } = req.query;

  if (!title || !description || !keywords || !url || !image || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const seoGenerator = new SeoGenerator({
    title: title as string,
    description: description as string,
    keywords: keywords as string[],
    url: url as string,
    image: image as string,
    type: type as string,
  });

  const metadata = await seoGenerator.generateSeoMetadata();

  return res.status(200).json(metadata);
};

export default SeoGenerator;

// src/types/index.ts
interface OpenGraphMetadata {
  title: string;
  description: string;
  url: string;
  image: string;
  type: string;
}

interface SchemaOrgMetadata {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  image: string;
}

// src/app/layout.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { getSeoMetadata } from '../lib/seo-generator';

function MyApp({ Component, pageProps }: AppProps) {
  const [seoMetadata, setSeoMetadata] = useState({ openGraph: {}, schemaOrg: {} });

  useEffect(() => {
    const fetchSeoMetadata = async () => {
      const metadata = await getSeoMetadata();
      setSeoMetadata(metadata);
    };

    fetchSeoMetadata();
  }, []);

  return (
    <div>
      <Head>
        <title>{seoMetadata.openGraph.title}</title>
        <meta name="description" content={seoMetadata.openGraph.description} />
        <meta property="og:title" content={seoMetadata.openGraph.title} />
        <meta property="og:description" content={seoMetadata.openGraph.description} />
        <meta property="og:url" content={seoMetadata.openGraph.url} />
        <meta property="og:image" content={seoMetadata.openGraph.image} />
        <meta property="og:type" content={seoMetadata.openGraph.type} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoMetadata.schemaOrg),
          }}
        />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;