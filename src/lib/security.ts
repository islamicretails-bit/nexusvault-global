// src/lib/security.ts
import * as crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { z } from 'zod';

// Define the security configuration
const securityConfig = {
  tokenSecret: process.env.TOKEN_SECRET as string,
  rateLimitMax: 100, // Maximum number of requests per minute
  rateLimitDuration: 60, // Duration of rate limiting in seconds
};

// Define the token schema
const tokenSchema = z.object({
  userId: z.string(),
  expiresAt: z.number(),
});

// Create a rate limiter
const rateLimiter = new RateLimiterMemory({
  points: securityConfig.rateLimitMax,
  duration: securityConfig.rateLimitDuration,
});

// Function to verify a token
export function verifyToken(token: string): boolean {
  try {
    const decodedToken = tokenSchema.parse(JSON.parse(crypto.createHmac('sha256', securityConfig.tokenSecret).update(token).digest('hex')));
    return decodedToken.expiresAt > Date.now();
  } catch (error) {
    return false;
  }
}

// Function to create a SHA-256 HMAC signature
export function createSignature(data: string): string {
  return crypto.createHmac('sha256', securityConfig.tokenSecret).update(data).digest('hex');
}

// Function to validate a payload
export function validatePayload(payload: any): boolean {
  try {
    const payloadSchema = z.object({
      userId: z.string(),
      data: z.any(),
    });
    payloadSchema.parse(payload);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to rate limit a request
export async function rateLimitRequest(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const ip = req.ip;
  const rateLimitKey = `rate-limit:${ip}`;
  const rateLimitResult = await rateLimiter.consume(rateLimitKey, 1);
  if (rateLimitResult.remainingPoints < 1) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return false;
  }
  return true;
}

// Function to authenticate a request
export async function authenticateRequest(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  const isValidToken = verifyToken(token);
  if (!isValidToken) {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
  return true;
}