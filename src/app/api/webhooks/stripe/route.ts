// src/app/api/webhooks/stripe/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from 'src/lib/stripe';
import { verifyStripeWebhook } from 'src/lib/security';
import { NotificationPayload } from 'src/types/index';
import { sendNotification } from 'src/lib/notifications';

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleStripeWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  const signature = req.headers['stripe-signature'];
  const event = req.body;

  try {
    const verifiedEvent = verifyStripeWebhook(event, signature, stripeWebhookSecret);

    if (verifiedEvent.type === 'payment_succeeded') {
      const paymentIntent = verifiedEvent.data.object;
      const notificationPayload: NotificationPayload = {
        eventType: 'payment_succeeded',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
      };

      await sendNotification(notificationPayload);
    }

    if (verifiedEvent.type === 'payment_failed') {
      const paymentIntent = verifiedEvent.data.object;
      const notificationPayload: NotificationPayload = {
        eventType: 'payment_failed',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
      };

      await sendNotification(notificationPayload);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid webhook signature' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await handleStripeWebhook(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// src/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export { stripe };

// src/lib/security.ts
import crypto from 'crypto';

export const verifyStripeWebhook = (event: any, signature: string, secret: string) => {
  const hash = crypto.createHmac('sha256', secret);
  hash.update(event);

  const expectedSignature = hash.digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid webhook signature');
  }

  return event;
};

// src/lib/notifications.ts
import { NotificationPayload } from 'src/types/index';

export const sendNotification = async (payload: NotificationPayload) => {
  // Implement your notification logic here
  console.log('Sending notification:', payload);
};

// src/types/index.ts
export interface NotificationPayload {
  eventType: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}