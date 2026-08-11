// src/lib/s3-storage.ts
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CloudflareR2 } from '@cloudflare/r2';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

interface S3StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  cloudflareAccountId: string;
  cloudflareApiKey: string;
}

interface S3File {
  key: string;
  bucket: string;
  expires: number;
}

class S3Storage {
  private s3Client: S3Client;
  private cloudflareR2: CloudflareR2;
  private config: S3StorageConfig;

  constructor(config: S3StorageConfig) {
    this.config = config;
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.cloudflareR2 = new CloudflareR2({
      accountId: config.cloudflareAccountId,
      apiKey: config.cloudflareApiKey,
    });
  }

  async uploadFile(file: Buffer, fileName: string): Promise<S3File> {
    const params = {
      Bucket: this.config.bucketName,
      Key: fileName,
      Body: file,
    };

    const data = await this.s3Client.putObject(params);
    return {
      key: fileName,
      bucket: this.config.bucketName,
      expires: data.Expires,
    };
  }

  async getSignedUrl(key: string, expires: number): Promise<string> {
    const params = {
      Bucket: this.config.bucketName,
      Key: key,
      Expires: expires,
    };

    const command = new AWS.S3.GetObjectCommand(params);
    const signedUrl = await getSignedUrl(this.s3Client, command);
    return signedUrl;
  }

  async uploadFileToCloudflareR2(file: Buffer, fileName: string): Promise<S3File> {
    const params = {
      bucket: this.config.bucketName,
      key: fileName,
      body: file,
    };

    const data = await this.cloudflareR2.put(params);
    return {
      key: fileName,
      bucket: this.config.bucketName,
      expires: data.expires,
    };
  }

  async getCloudflareR2SignedUrl(key: string, expires: number): Promise<string> {
    const params = {
      bucket: this.config.bucketName,
      key: key,
      expires: expires,
    };

    const signedUrl = await this.cloudflareR2.getSignedUrl(params);
    return signedUrl;
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.config.bucketName,
      Key: key,
    };

    await this.s3Client.deleteObject(params);
  }

  async deleteFileFromCloudflareR2(key: string): Promise<void> {
    const params = {
      bucket: this.config.bucketName,
      key: key,
    };

    await this.cloudflareR2.delete(params);
  }
}

export { S3Storage, S3StorageConfig, S3File };

// Example usage
import { S3Storage, S3StorageConfig } from './s3-storage';

const config: S3StorageConfig = {
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  bucketName: 'YOUR_BUCKET_NAME',
  region: 'YOUR_REGION',
  cloudflareAccountId: 'YOUR_CLOUDFLARE_ACCOUNT_ID',
  cloudflareApiKey: 'YOUR_CLOUDFLARE_API_KEY',
};

const s3Storage = new S3Storage(config);

const file = Buffer.from('Hello World!', 'utf-8');
const fileName = `file-${uuidv4()}.txt`;

s3Storage.uploadFile(file, fileName).then((data) => {
  console.log(data);
  const signedUrl = s3Storage.getSignedUrl(data.key, 3600);
  console.log(signedUrl);
});