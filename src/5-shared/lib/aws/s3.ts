import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.AWS_S3_BUCKET!;

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function getS3Key(tenantId: string, section: string, filename: string) {
  return `${tenantId}/${section}/${filename}`;
}

export async function uploadToS3({
  tenantId,
  section,
  filename,
  body,
  contentType,
}: {
  tenantId: string;
  section: string;
  filename: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType: string;
}) {
  const Key = getS3Key(tenantId, section, filename);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key,
      Body: body,
      ContentType: contentType,
    })
  );
  return Key;
}

export async function getS3ObjectStream(key: string) {
  const res = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
  return res.Body as ReadableStream | undefined;
}

export async function deleteS3Object(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function headS3Object(key: string) {
  return s3Client.send(
    new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}
