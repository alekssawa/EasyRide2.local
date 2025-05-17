import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const generatePresignedUrl = async (file: { name: string, type: string }) => {
  const fileExtension = file.name.split('.').pop();
  const key = `avatars/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: file.type,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return {
    url,
    key,
    publicUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  };
};

export const deleteFileFromS3 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  await s3.send(command);
};

export const extractKeyFromUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return decodeURIComponent(parsedUrl.pathname.substring(1));
  } catch (e) {
    console.error("Error extracting key from URL:", e);
    return null;
  }
};

export default s3;