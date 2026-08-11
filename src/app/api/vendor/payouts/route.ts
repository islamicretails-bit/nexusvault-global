// src/app/api/vendor/payouts/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '../../../lib/security';
import { PayoutRequest } from '../../../types/index';

const prisma = new PrismaClient();

// Define payout request route handler
const payoutRequestHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Validate token and extract vendor ID
    const token = req.headers['authorization'];
    const vendorId = await validateToken(token);
    if (!vendorId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get payout requests for vendor
    const payoutRequests = await prisma.payoutRequest.findMany({
      where: { vendorId },
      include: { order: true },
    });

    // Return payout requests
    return res.status(200).json(payoutRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Define payout request creation route handler
const createPayoutRequestHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Validate token and extract vendor ID
    const token = req.headers['authorization'];
    const vendorId = await validateToken(token);
    if (!vendorId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get payout request data from request body
    const { orderId, amount } = req.body as PayoutRequest;

    // Create payout request
    const payoutRequest = await prisma.payoutRequest.create({
      data: { vendorId, orderId, amount },
    });

    // Return created payout request
    return res.status(201).json(payoutRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Define payout request update route handler
const updatePayoutRequestHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Validate token and extract vendor ID
    const token = req.headers['authorization'];
    const vendorId = await validateToken(token);
    if (!vendorId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get payout request ID from request params
    const payoutRequestId = req.query.id as string;

    // Get payout request data from request body
    const { status } = req.body as PayoutRequest;

    // Update payout request
    const payoutRequest = await prisma.payoutRequest.update({
      where: { id: payoutRequestId },
      data: { status },
    });

    // Return updated payout request
    return res.status(200).json(payoutRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Export payout request route handlers
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return payoutRequestHandler(req, res);
    case 'POST':
      return createPayoutRequestHandler(req, res);
    case 'PUT':
      return updatePayoutRequestHandler(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}