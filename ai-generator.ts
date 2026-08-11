// src/lib/ai-generator.ts
import { PrismaClient } from '@prisma/client';
import { AIRouterConfig } from '../types/index';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as util from 'util';

const prisma = new PrismaClient();
const aiRouterConfig: AIRouterConfig = {
  groq: {
    endpoint: 'https://api.groq.com/v1/',
    apiKey: 'YOUR_GROQ_API_KEY',
  },
  gemini: {
    endpoint: 'https://api.gemini.com/v1/',
    apiKey: 'YOUR_GEMINI_API_KEY',
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/',
    apiKey: 'YOUR_OPENAI_API_KEY',
  },
};

interface AIModel {
  name: string;
  description: string;
  prompt: string;
  parameters: {
    maxTokens: number;
    temperature: number;
    topP: number;
  };
}

interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    logprobs: {
      tokens: number[];
    };
  }[];
}

class AIGenerator {
  private prisma: PrismaClient;
  private aiRouterConfig: AIRouterConfig;

  constructor(prisma: PrismaClient, aiRouterConfig: AIRouterConfig) {
    this.prisma = prisma;
    this.aiRouterConfig = aiRouterConfig;
  }

  async generateAsset(prompt: string, model: string): Promise<string> {
    const response = await this.sendAIRequest(prompt, model);
    return response.choices[0].text;
  }

  async sendAIRequest(prompt: string, model: string): Promise<AIResponse> {
    const endpoint = this.getEndpoint(model);
    const apiKey = this.getApiKey(model);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    const data = {
      prompt,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 1,
    };
    const response = await axios.post(endpoint, data, { headers });
    return response.data;
  }

  getEndpoint(model: string): string {
    switch (model) {
      case 'groq':
        return this.aiRouterConfig.groq.endpoint;
      case 'gemini':
        return this.aiRouterConfig.gemini.endpoint;
      case 'openai':
        return this.aiRouterConfig.openai.endpoint;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  getApiKey(model: string): string {
    switch (model) {
      case 'groq':
        return this.aiRouterConfig.groq.apiKey;
      case 'gemini':
        return this.aiRouterConfig.gemini.apiKey;
      case 'openai':
        return this.aiRouterConfig.openai.apiKey;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }
}

const aiGenerator = new AIGenerator(prisma, aiRouterConfig);

async function generateEbook(title: string, description: string): Promise<string> {
  const prompt = `Generate an ebook with the title "${title}" and description "${description}"`;
  const model = 'openai';
  const response = await aiGenerator.generateAsset(prompt, model);
  return response;
}

async function generateCode(prompt: string): Promise<string> {
  const model = 'groq';
  const response = await aiGenerator.generateAsset(prompt, model);
  return response;
}

async function generateGraphicAsset(prompt: string): Promise<string> {
  const model = 'gemini';
  const response = await aiGenerator.generateAsset(prompt, model);
  return response;
}

// Example usage:
generateEbook('My Ebook', 'This is a description of my ebook')
  .then((response) => console.log(response))
  .catch((error) => console.error(error));

generateCode('Generate a Python script that prints "Hello World"')
  .then((response) => console.log(response))
  .catch((error) => console.error(error));

generateGraphicAsset('Generate an image of a cat')
  .then((response) => console.log(response))
  .catch((error) => console.error(error));