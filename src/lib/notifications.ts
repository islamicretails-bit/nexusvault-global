// src/lib/notifications.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from './email';
import { webhook } from './webhook';
import { NotificationPayload } from '../types/index';

// Define the notification channels
enum NotificationChannel {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
}

// Define the notification types
enum NotificationType {
  TRANSACTIONAL = 'transactional',
  MARKETING = 'marketing',
}

// Define the notification service interface
interface NotificationService {
  sendNotification(payload: NotificationPayload): Promise<void>;
}

// Define the email notification service
class EmailNotificationService implements NotificationService {
  async sendNotification(payload: NotificationPayload): Promise<void> {
    const { to, subject, body } = payload;
    await sendEmail(to, subject, body);
  }
}

// Define the webhook notification service
class WebhookNotificationService implements NotificationService {
  async sendNotification(payload: NotificationPayload): Promise<void> {
    const { url, data } = payload;
    await webhook(url, data);
  }
}

// Define the notification factory
class NotificationFactory {
  static createNotificationService(channel: NotificationChannel): NotificationService {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return new EmailNotificationService();
      case NotificationChannel.WEBHOOK:
        return new WebhookNotificationService();
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }
}

// Define the notification sender
async function sendNotification(
  channel: NotificationChannel,
  payload: NotificationPayload,
): Promise<void> {
  const notificationService = NotificationFactory.createNotificationService(channel);
  await notificationService.sendNotification(payload);
}

// Define the email sender
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // Implement email sending logic using a library like Nodemailer or Sendgrid
  // For demonstration purposes, we'll use a simple console log
  console.log(`Sending email to ${to} with subject ${subject} and body ${body}`);
}

// Define the webhook sender
async function webhook(url: string, data: any): Promise<void> {
  // Implement webhook sending logic using a library like Axios or Fetch
  // For demonstration purposes, we'll use a simple console log
  console.log(`Sending webhook to ${url} with data ${JSON.stringify(data)}`);
}

// Example usage
async function exampleUsage(): Promise<void> {
  const payload: NotificationPayload = {
    to: 'example@example.com',
    subject: 'Hello World',
    body: 'This is a test email',
  };

  await sendNotification(NotificationChannel.EMAIL, payload);

  const webhookPayload: NotificationPayload = {
    url: 'https://example.com/webhook',
    data: { message: 'Hello World' },
  };

  await sendNotification(NotificationChannel.WEBHOOK, webhookPayload);
}

// Call the example usage function
exampleUsage();

// src/types/index.ts
interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
  url?: string;
  data?: any;
}

// src/lib/email.ts
import nodemailer from 'nodemailer';

// Define the email sender
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
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
    to,
    subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
}

export { sendEmail };

// src/lib/webhook.ts
import axios from 'axios';

// Define the webhook sender
async function webhook(url: string, data: any): Promise<void> {
  await axios.post(url, data);
}

export { webhook };