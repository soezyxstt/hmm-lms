// ~/lib/r2-client.ts
import { S3Client } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from '~/env';

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const R2_BUCKET = env.CLOUDFLARE_R2_BUCKET_NAME;
export const R2_PUBLIC_URL = env.CLOUDFLARE_R2_PUBLIC_URL;

export {
  r2Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  getSignedUrl,
};
