import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname, join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private s3: S3Client | null = null;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    const accountId  = config.get<string>('R2_ACCOUNT_ID');
    const accessKey  = config.get<string>('R2_ACCESS_KEY_ID');
    const secretKey  = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket      = config.get<string>('R2_BUCKET') ?? 'photoforge-uploads';
    this.publicUrl   = (config.get<string>('R2_PUBLIC_URL') ?? '').replace(/\/$/, '');

    if (accountId && accessKey && secretKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      });
      console.log(`[UploadService] R2 configured — bucket: ${this.bucket}, publicUrl: ${this.publicUrl}`);
    } else {
      console.warn('[UploadService] R2 NOT configured — using local filesystem (uploads will be lost on redeploy)');
    }
  }

  get isCloud(): boolean {
    return this.s3 !== null;
  }

  async save(buffer: Buffer, originalname: string, mimetype: string): Promise<string> {
    const filename = `${randomUUID()}${extname(originalname)}`;

    if (this.s3) {
      await this.s3.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
      }));
      return `${this.publicUrl}/${filename}`;
    }

    // Local fallback — save to disk
    const dir = join(process.cwd(), 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    return `/uploads/${filename}`;
  }
}
