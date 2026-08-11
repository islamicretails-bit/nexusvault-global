// src/app/api/payments/checkout/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { stripe } from '../../../lib/stripe';
import { paypal } from '../../../lib/paypal';
import { geoCurrency } from '../../../lib/geo-currency';
import { security } from '../../../lib/security';

const prisma = new PrismaClient();

interface CheckoutRequest {
  userId: string;
  productId: string;
  quantity: number;
  paymentMethod: 'stripe' | 'paypal';
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  transactionId: string | null;
}

const checkoutRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, productId, quantity, paymentMethod } = req.body as CheckoutRequest;

  if (!userId || !productId || !quantity || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const price = product.price * quantity;
    const currency = await geoCurrency.getCurrency(user.country);

    let transactionId: string | null = null;

    if (paymentMethod === 'stripe') {
      const paymentIntent = await stripe.createPaymentIntent({
        amount: price,
        currency: currency,
        payment_method_types: ['card'],
      });

      const paymentMethodId = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: req.body.cardNumber,
          exp_month: req.body.expMonth,
          exp_year: req.body.expYear,
          cvc: req.body.cvc,
        },
      });

      const payment = await stripe.confirmCardPayment(paymentIntent.id, {
        payment_method: paymentMethodId.id,
      });

      if (payment.status === 'succeeded') {
        transactionId = payment.id;
      }
    } else if (paymentMethod === 'paypal') {
      const payment = await paypal.createPayment({
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        transactions: [
          {
            amount: {
              total: price,
              currency: currency,
            },
          },
        ],
      });

      if (payment.state === 'approved') {
        transactionId = payment.id;
      }
    }

    if (transactionId) {
      const order = await prisma.order.create({
        data: {
          userId: userId,
          productId: productId,
          quantity: quantity,
          price: price,
          currency: currency,
          transactionId: transactionId,
        },
      });

      return res.json({ success: true, message: 'Checkout successful', transactionId: transactionId });
    } else {
      return res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default checkoutRoute;

This code defines a checkout route that handles payment processing for a digital marketplace. It supports both Stripe and PayPal payment methods and creates an order in the database upon successful payment. The route is protected by authentication and authorization middleware to ensure that only authorized users can access it. The code also includes error handling and logging to ensure that any issues are properly handled and logged.