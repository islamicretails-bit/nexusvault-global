// src/app/api/cron/auto-generate/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { cronJob } from 'cron';
import { generateProduct } from '../../../lib/ai-generator';
import { AIRouterConfig } from '../../../types/index';
import { getAIModel } from '../../../lib/ai-router';

const prisma = new PrismaClient();

// Define the cron job to run every hour
const cron = new cronJob('0 * * * *', async () => {
  try {
    // Get the AI model configuration
    const aiModelConfig: AIRouterConfig = await getAIModel();

    // Generate a new product using the AI model
    const product = await generateProduct(aiModelConfig);

    // Save the product to the database
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
      },
    });

    console.log('Product generated and saved successfully');
  } catch (error) {
    console.error('Error generating product:', error);
  }
});

// Define the API route
const autoGenerateRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check if the cron job is already running
    if (cron.running) {
      return res.status(200).json({ message: 'Cron job is already running' });
    }

    // Start the cron job
    cron.start();

    return res.status(200).json({ message: 'Cron job started successfully' });
  } catch (error) {
    console.error('Error starting cron job:', error);
    return res.status(500).json({ message: 'Error starting cron job' });
  }
};

export default autoGenerateRoute;

// src/lib/ai-generator.ts
import { AIRouterConfig } from '../../../types/index';
import { getAIModel } from './ai-router';

const generateProduct = async (aiModelConfig: AIRouterConfig) => {
  try {
    // Use the AI model to generate a new product
    const product = await getAIModel(aiModelConfig);

    return product;
  } catch (error) {
    console.error('Error generating product:', error);
    throw error;
  }
};

export { generateProduct };

// src/lib/ai-router.ts
import { AIRouterConfig } from '../../../types/index';

const getAIModel = async (aiModelConfig: AIRouterConfig) => {
  try {
    // Use the AI model configuration to get the AI model
    const aiModel = await getAIModel(aiModelConfig);

    return aiModel;
  } catch (error) {
    console.error('Error getting AI model:', error);
    throw error;
  }
};

export { getAIModel };

// src/types/index.ts
interface AIRouterConfig {
  model: string;
  apiKey: string;
  apiSecret: string;
}

interface Product {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export { AIRouterConfig, Product };

// prisma/schema.prisma
model Product {
  id       String   @id @default(cuid())
  name     String
  description String
  price    Float
  imageUrl String
}

model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  role     Role     @default(CUSTOMER)
}

enum Role {
  ADMIN
  VENDOR
  CUSTOMER
  AFFILIATE
}