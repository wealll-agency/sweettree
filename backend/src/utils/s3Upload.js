import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Uploads a file buffer to AWS S3
 * @param {Buffer} fileBuffer - The memory buffer of the file
 * @param {string} mimetype - The MIME type of the file (e.g., 'image/jpeg')
 * @param {string} originalName - The original file name
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadToS3 = async (fileBuffer, mimetype, originalName) => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  const bucketName = process.env.AWS_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured');
  }

  const fileName = `${Date.now()}-${originalName.replace(/\s+/g, '-')}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype
  });

  try {
    await s3Client.send(command);
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
};
