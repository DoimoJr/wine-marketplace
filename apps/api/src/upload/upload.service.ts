import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File, userId: string, type: 'wine' | 'avatar' = 'wine'): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG and WebP images are allowed');
    }

    // Validate file size
    const maxSize = type === 'avatar' ? 2 * 1024 * 1024 : 10 * 1024 * 1024; // 2MB for avatar, 10MB for wine images
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.originalname);
    const filename = `${type}_${userId}_${timestamp}_${randomString}${extension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', type);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    // Return public URL (in production, this would be a CDN URL)
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3002');
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  async uploadMultipleImages(files: Express.Multer.File[], userId: string): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed');
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const url = await this.uploadImage(file, userId, 'wine');
      uploadedUrls.push(url);
    }

    return uploadedUrls;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const type = urlParts[urlParts.length - 2]; // 'wine' or 'avatar'
      
      const filepath = path.join(process.cwd(), 'uploads', type, filename);
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error, just log it
    }
  }
}