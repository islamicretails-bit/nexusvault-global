// src/types/index.ts

// Import required types from other modules
import { Prisma } from '@prisma/client';

// Define User interface
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER' | 'AFFILIATE';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Product interface
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Order interface
export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// Define OrderItem interface
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define CustomRequest interface
export interface CustomRequest {
  id: string;
  userId: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// Define AnalyticsLog interface
export interface AnalyticsLog {
  id: string;
  userId: string;
  eventType: string;
  eventData: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define AffiliateReferral interface
export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  referralId: string;
  commission: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// Define WalletTransaction interface
export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// Define PayoutRequest interface
export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// Define AIServiceLog interface
export interface AIServiceLog {
  id: string;
  service: string;
  request: string;
  response: string;
  status: 'SUCCESS' | 'FAILURE';
  createdAt: Date;
  updatedAt: Date;
}

// Define AIRouterConfig interface
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

// Define GeoLocation interface
export interface GeoLocation {
  ip: string;
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
}

// Define NotificationPayload interface
export interface NotificationPayload {
  type: 'EMAIL' | 'WEBHOOK';
  data: string;
}

// Define DynamicFeatureMetadata interface
export interface DynamicFeatureMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define PrismaClient interface
export interface PrismaClient extends Prisma.PrismaClient<Prisma.PrismaClientOptions, never> {}

// Define APIError interface
export interface APIError {
  code: number;
  message: string;
  details: string;
}

// Define APIResponse interface
export interface APIResponse<T> {
  data: T;
  error: APIError | null;
}