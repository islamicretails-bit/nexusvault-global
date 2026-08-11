// src/app/api/downloads/secure/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createHmac } from 'crypto';
import { CloudflareR2 } from '@cloudflare/r2';
import { getPresignedUrl } from '@cloudflare/r2-presigned-url';

const prisma = new PrismaClient();
const r2 = new CloudflareR2({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
});

const downloadRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileId, token } = req.query;

  if (!fileId || !token) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const file = await prisma.file.findFirst({
    where: {
      id: fileId as string,
    },
  });

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const expectedToken = createHmac('sha256', process.env.SECRET_KEY)
    .update(fileId as string)
    .digest('hex');

  if (expectedToken !== token) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const presignedUrl = await getPresignedUrl(r2, {
    bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    object: file.objectKey,
    method: 'GET',
    expires: Date.now() + 3600000, // 1 hour
  });

  return res.status(200).json({ url: presignedUrl });
};

export default downloadRoute;