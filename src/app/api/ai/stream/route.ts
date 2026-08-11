// src/app/api/ai/stream/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { AIRouterConfig } from 'src/types/index';
import { aiRouter } from 'src/lib/ai-router';
import { geoCurrency } from 'src/lib/geo-currency';

const prisma = new PrismaClient();

interface StreamRequest {
  prompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface StreamResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

const streamRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, maxTokens, temperature, topP, frequencyPenalty, presencePenalty } = req.body as StreamRequest;

  if (!prompt || !maxTokens || !temperature || !topP || !frequencyPenalty || !presencePenalty) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const aiRouterConfig: AIRouterConfig = {
      prompt,
      maxTokens,
      temperature,
      topP,
      frequencyPenalty,
      presencePenalty,
    };

    const response = await aiRouter(aiRouterConfig);

    const streamResponse: StreamResponse = {
      id: crypto.randomUUID(),
      prompt,
      response: response.text,
      timestamp: new Date(),
    };

    await prisma.streamResponse.create({
      data: streamResponse,
    });

    return res.status(200).json(streamResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default streamRoute;

// src/lib/ai-router.ts
import { AIRouterConfig } from 'src/types/index';
import axios from 'axios';

const aiRouter = async (config: AIRouterConfig) => {
  const groqApi = 'https://api.groq.com/v1/completions';
  const geminiApi = 'https://api.gemini.ai/v1/completions';
  const openAiApi = 'https://api.openai.com/v1/completions';

  const apiEndpoints = [groqApi, geminiApi, openAiApi];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await axios.post(endpoint, {
        prompt: config.prompt,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  }

  throw new Error('All AI APIs failed');
};

export { aiRouter };

// src/types/index.ts
interface AIRouterConfig {
  prompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface StreamRequest {
  prompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface StreamResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

export { AIRouterConfig, StreamRequest, StreamResponse };

// prisma/schema.prisma
model StreamResponse {
  id       String   @id @default(cuid())
  prompt   String
  response String
  timestamp DateTime @default(now())
}