import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { PayPalWebhookEvent } from 'paypal-rest-sdk';
import { PrismaClient } from '@prisma/client';
import { PayPalWebhookSecret } from '../lib/security';

const prisma = new PrismaClient();

const paypalWebhookSecret = process.env.PAYPAL_WEBHOOK_SECRET as string;

interface PayPalWebhookRequest extends NextApiRequest {
  body: PayPalWebhookEvent;
}

const route = async (req: PayPalWebhookRequest, res: NextApiResponse) => {
  try {
    const verification = verify(req.headers['x-pp-webhook'], paypalWebhookSecret);
    if (!verification) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const webhookEvent = req.body;
    const eventType = webhookEvent.event_type;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(webhookEvent);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentCaptureDenied(webhookEvent);
        break;
      case 'PAYMENT.CAPTURE.PENDING':
        await handlePaymentCapturePending(webhookEvent);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }

    return res.status(200).json({ message: 'Webhook event processed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handlePaymentCaptureCompleted = async (webhookEvent: PayPalWebhookEvent) => {
  const paymentId = webhookEvent.resource.id;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    console.log(`Payment not found: ${paymentId}`);
    return;
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'COMPLETED' },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'PAID' },
  });
};

const handlePaymentCaptureDenied = async (webhookEvent: PayPalWebhookEvent) => {
  const paymentId = webhookEvent.resource.id;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    console.log(`Payment not found: ${paymentId}`);
    return;
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'DENIED' },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'FAILED' },
  });
};

const handlePaymentCapturePending = async (webhookEvent: PayPalWebhookEvent) => {
  const paymentId = webhookEvent.resource.id;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    console.log(`Payment not found: ${paymentId}`);
    return;
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'PENDING' },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'PENDING' },
  });
};

export default route;