// src/lib/ai-router.ts
import axios from 'axios';
import { AIRouterConfig } from '../types/index';

interface AIModel {
  name: string;
  endpoint: string;
  apiKey: string;
}

interface AIResponse {
  status: number;
  data: any;
}

class AIRouter {
  private models: AIModel[];
  private fallbackModel: AIModel;
  private config: AIRouterConfig;

  constructor(config: AIRouterConfig) {
    this.config = config;
    this.models = [
      {
        name: 'Groq',
        endpoint: 'https://api.groq.com/v1/',
        apiKey: config.groqApiKey,
      },
      {
        name: 'Gemini',
        endpoint: 'https://api.gemini.com/v1/',
        apiKey: config.geminiApiKey,
      },
      {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/',
        apiKey: config.openaiApiKey,
      },
    ];
    this.fallbackModel = this.models[0];
  }

  async routeQuery(query: string): Promise<AIResponse> {
    for (const model of this.models) {
      try {
        const response = await axios.post(`${model.endpoint}query`, {
          query,
          api_key: model.apiKey,
        });
        return {
          status: response.status,
          data: response.data,
        };
      } catch (error) {
        console.error(`Error routing query to ${model.name}: ${error.message}`);
      }
    }
    // Fallback to the first model if all others fail
    try {
      const response = await axios.post(`${this.fallbackModel.endpoint}query`, {
        query,
        api_key: this.fallbackModel.apiKey,
      });
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      console.error(`Error routing query to fallback model ${this.fallbackModel.name}: ${error.message}`);
      throw error;
    }
  }
}

export default AIRouter;

// src/types/index.ts
interface AIRouterConfig {
  groqApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
}

export { AIRouterConfig };

// src/app/api/ai/generate-product/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import AIRouter from '../../lib/ai-router';

const airouter = new AIRouter({
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
});

const generateProduct = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const query = req.body.query;
    try {
      const response = await airouter.routeQuery(query);
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate product' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default generateProduct;

// src/app/api/ai/stream/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import AIRouter from '../../lib/ai-router';

const airouter = new AIRouter({
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
});

const streamAI = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const query = req.body.query;
    try {
      const response = await airouter.routeQuery(query);
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to stream AI' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default streamAI;