// src/app/api/ai/generate-product/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { AIRouterConfig } from '../../types/index';
import { aiGenerator } from '../../lib/ai-generator';
import { aiRouter } from '../../lib/ai-router';
import { geoCurrency } from '../../lib/geo-currency';
import { security } from '../../lib/security';

const prisma = new PrismaClient();

const generateProductRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Validate request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, productType } = req.body;

    if (!prompt || !productType) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Verify token
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const verifiedToken = security.verifyToken(token as string);
    if (!verifiedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user's geo location
    const geoLocation = await geoCurrency.getGeoLocation(req.ip);
    if (!geoLocation) {
      return res.status(500).json({ error: 'Failed to get geo location' });
    }

    // Generate product using AI
    const aiConfig: AIRouterConfig = {
      prompt,
      productType,
      geoLocation,
    };

    const generatedProduct = await aiGenerator.generateProduct(aiConfig);
    if (!generatedProduct) {
      return res.status(500).json({ error: 'Failed to generate product' });
    }

    // Save product to database
    const product = await prisma.product.create({
      data: {
        name: generatedProduct.name,
        description: generatedProduct.description,
        price: generatedProduct.price,
        type: productType,
        userId: verifiedToken.userId,
      },
    });

    // Return generated product
    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default generateProductRoute;