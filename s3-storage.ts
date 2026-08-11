// s3-storage.ts
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CloudflareR2 } from '@cloudflare/r2';
import { Readable } from 'stream';

interface S3StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  cloudflareAccountId: string;
  cloudflareApiKey: string;
}

interface S3File {
  key: string;
  contentType: string;
  content: Buffer;
}

class S3Storage {
  private config: S3StorageConfig;
  private s3: AWS.S3;
  private cloudflareR2: CloudflareR2;

  constructor(config: S3StorageConfig) {
    this.config = config;
    this.s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
    this.cloudflareR2 = new CloudflareR2({
      accountId: config.cloudflareAccountId,
      apiKey: config.cloudflareApiKey,
    });
  }

  async uploadFile(file: S3File): Promise<string> {
    const params = {
      Bucket: this.config.bucketName,
      Key: file.key,
      ContentType: file.contentType,
      Body: file.content,
    };

    const data = await this.s3.upload(params).promise();
    return data.Location;
  }

  async generatePresignedUrl(key: string, expires: number): Promise<string> {
    const params = {
      Bucket: this.config.bucketName,
      Key: key,
      Expires: expires,
    };

    const presignedUrl = this.s3.getSignedUrl('getObject', params);
    return presignedUrl;
  }

  async uploadFileToCloudflareR2(file: S3File): Promise<string> {
    const uploadUrl = await this.cloudflareR2.getUploadUrl({
      bucket: this.config.bucketName,
      key: file.key,
    });

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.contentType,
      },
      body: file.content,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file to Cloudflare R2: ${response.statusText}`);
    }

    return response.url;
  }

  async generatePresignedUrlForCloudflareR2(key: string, expires: number): Promise<string> {
    const presignedUrl = await this.cloudflareR2.getPresignedUrl({
      bucket: this.config.bucketName,
      key: key,
      expires: expires,
    });

    return presignedUrl;
  }
}

export { S3Storage, S3StorageConfig, S3File };

// example usage
import { S3Storage, S3StorageConfig, S3File } from './s3-storage';

const config: S3StorageConfig = {
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  region: 'YOUR_REGION',
  bucketName: 'YOUR_BUCKET_NAME',
  cloudflareAccountId: 'YOUR_CLOUDFLARE_ACCOUNT_ID',
  cloudflareApiKey: 'YOUR_CLOUDFLARE_API_KEY',
};

const s3Storage = new S3Storage(config);

const file: S3File = {
  key: 'example.txt',
  contentType: 'text/plain',
  content: Buffer.from('Hello World!'),
};

s3Storage.uploadFile(file).then((url) => {
  console.log(`File uploaded to S3: ${url}`);
});

s3Storage.generatePresignedUrl('example.txt', 3600).then((presignedUrl) => {
  console.log(`Presigned URL for S3: ${presignedUrl}`);
});

s3Storage.uploadFileToCloudflareR2(file).then((url) => {
  console.log(`File uploaded to Cloudflare R2: ${url}`);
});

s3Storage.generatePresignedUrlForCloudflareR2('example.txt', 3600).then((presignedUrl) => {
  console.log(`Presigned URL for Cloudflare R2: ${presignedUrl}`);
});