// src/app/api/admin/analytics/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../lib/security';
import { AnalyticsLog } from '../../../types/index';

const prisma = new PrismaClient();

// Define the analytics route handler
const analyticsRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  // Authenticate the request
  const authenticated = await authenticate(req);
  if (!authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the analytics logs from the database
  const analyticsLogs = await prisma.analyticsLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  // Map the analytics logs to the desired format
  const formattedLogs: AnalyticsLog[] = analyticsLogs.map((log) => ({
    id: log.id,
    userId: log.userId,
    eventType: log.eventType,
    eventData: log.eventData,
    createdAt: log.createdAt,
  }));

  // Return the formatted analytics logs
  return res.status(200).json(formattedLogs);
};

// Define the API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return analyticsRoute(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}