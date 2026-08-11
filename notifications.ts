// src/lib/notifications.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from './email';
import { webhook } from './webhook';
import { NotificationPayload } from '../types/index';

const notificationChannels = {
  email: sendEmail,
  webhook: webhook,
};

const sendNotification = async (payload: NotificationPayload) => {
  const { channel, ...data } = payload;
  const notificationChannel = notificationChannels[channel];

  if (!notificationChannel) {
    throw new Error(`Invalid notification channel: ${channel}`);
  }

  try {
    await notificationChannel(data);
  } catch (error) {
    console.error(`Error sending notification: ${error.message}`);
  }
};

const handleWebhookNotification = async (req: NextApiRequest, res: NextApiResponse) => {
  const { event, data } = req.body;

  if (event === 'payment.success') {
    const notificationPayload: NotificationPayload = {
      channel: 'email',
      subject: 'Payment Successful',
      message: `Payment of ${data.amount} has been successful`,
      recipient: data.customerEmail,
    };

    await sendNotification(notificationPayload);
  }

  res.status(200).json({ message: 'Webhook notification handled successfully' });
};

const handleEmailNotification = async (req: NextApiRequest, res: NextApiResponse) => {
  const { subject, message, recipient } = req.body;

  const notificationPayload: NotificationPayload = {
    channel: 'email',
    subject,
    message,
    recipient,
  };

  await sendNotification(notificationPayload);

  res.status(200).json({ message: 'Email notification sent successfully' });
};

export { sendNotification, handleWebhookNotification, handleEmailNotification };

// src/lib/email.ts
import nodemailer from 'nodemailer';

const sendEmail = async (data: { subject: string; message: string; recipient: string }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false, // or 'STARTTLS'
    auth: {
      user: 'username',
      pass: 'password',
    },
  });

  const mailOptions = {
    from: 'sender@example.com',
    to: data.recipient,
    subject: data.subject,
    text: data.message,
  };

  await transporter.sendMail(mailOptions);
};

export { sendEmail };

// src/lib/webhook.ts
import axios from 'axios';

const webhook = async (data: { url: string; payload: any }) => {
  try {
    const response = await axios.post(data.url, data.payload);
    console.log(`Webhook sent successfully: ${response.status}`);
  } catch (error) {
    console.error(`Error sending webhook: ${error.message}`);
  }
};

export { webhook };

// src/types/index.ts
interface NotificationPayload {
  channel: 'email' | 'webhook';
  subject?: string;
  message?: string;
  recipient?: string;
  url?: string;
  payload?: any;
}

export { NotificationPayload };