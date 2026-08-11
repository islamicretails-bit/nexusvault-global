// security.ts
import * as crypto from 'crypto';
import * as rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// Define the security configuration interface
interface SecurityConfig {
  secretKey: string;
  rateLimitMax: number;
  rateLimitWindow: number;
}

// Define the token verification interface
interface TokenVerification {
  isValid: boolean;
  payload: any;
}

// Define the SHA-256 HMAC signature creation interface
interface HmacSignature {
  signature: string;
}

// Define the rate limiting interface
interface RateLimiting {
  limit: number;
  window: number;
}

// Define the payload validation interface
interface PayloadValidation {
  isValid: boolean;
  errors: any[];
}

// Define the security class
class Security {
  private config: SecurityConfig;
  private rateLimiter: rateLimit.RateLimiter;

  constructor(config: SecurityConfig) {
    this.config = config;
    this.rateLimiter = rateLimit({
      windowMs: config.rateLimitWindow,
      max: config.rateLimitMax,
    });
  }

  // Token verification method
  public verifyToken(token: string): TokenVerification {
    try {
      const payload = this.decodeToken(token);
      return { isValid: true, payload };
    } catch (error) {
      return { isValid: false, payload: null };
    }
  }

  // SHA-256 HMAC signature creation method
  public createHmacSignature(data: string): HmacSignature {
    const hmac = crypto.createHmac('sha256', this.config.secretKey);
    hmac.update(data);
    return { signature: hmac.digest('hex') };
  }

  // Rate limiting method
  public rateLimit(req: Request, res: Response, next: NextFunction): void {
    this.rateLimiter(req, res, (error) => {
      if (error) {
        res.status(429).send('Too many requests');
      } else {
        next();
      }
    });
  }

  // Payload validation method
  public validatePayload(payload: any, schema: z.ZodSchema<any>): PayloadValidation {
    try {
      const result = schema.parse(payload);
      return { isValid: true, errors: [] };
    } catch (error) {
      return { isValid: false, errors: error.issues };
    }
  }

  // Decode token method
  private decodeToken(token: string): any {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(decoded);
  }
}

// Export the security class
export default Security;

// src/types/index.ts
import { z } from 'zod';

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER' | 'AFFILIATE';
}

// Define the product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Define the order interface
export interface Order {
  id: string;
  userId: string;
  products: Product[];
  total: number;
}

// Define the AIRouterConfig interface
export interface AIRouterConfig {
  groq: {
    apiKey: string;
    apiUrl: string;
  };
  gemini: {
    apiKey: string;
    apiUrl: string;
  };
  openai: {
    apiKey: string;
    apiUrl: string;
  };
}

// Define the GeoLocation interface
export interface GeoLocation {
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

// Define the PayoutRequest interface
export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
}

// Define the NotificationPayload interface
export interface NotificationPayload {
  id: string;
  userId: string;
  message: string;
}

// Define the DynamicFeatureMetadata interface
export interface DynamicFeatureMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
}

// Define the zod schema for user
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['ADMIN', 'VENDOR', 'CUSTOMER', 'AFFILIATE']),
});

// Define the zod schema for product
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
});

// Define the zod schema for order
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  products: z.array(productSchema),
  total: z.number(),
});

// Define the zod schema for AIRouterConfig
export const airouterConfigSchema = z.object({
  groq: z.object({
    apiKey: z.string(),
    apiUrl: z.string(),
  }),
  gemini: z.object({
    apiKey: z.string(),
    apiUrl: z.string(),
  }),
  openai: z.object({
    apiKey: z.string(),
    apiUrl: z.string(),
  }),
});

// Define the zod schema for GeoLocation
export const geoLocationSchema = z.object({
  ip: z.string(),
  country: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

// Define the zod schema for PayoutRequest
export const payoutRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string(),
});

// Define the zod schema for NotificationPayload
export const notificationPayloadSchema = z.object({
  id: z.string(),
  userId: z.string(),
  message: z.string(),
});

// Define the zod schema for DynamicFeatureMetadata
export const dynamicFeatureMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
});