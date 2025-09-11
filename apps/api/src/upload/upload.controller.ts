import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload single image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    const imageUrl = await this.uploadService.uploadImage(file, user.id, 'wine');
    return { imageUrl };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or too many files' })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    const imageUrls = await this.uploadService.uploadMultipleImages(files, user.id);
    return { imageUrls };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    const avatarUrl = await this.uploadService.uploadImage(file, user.id, 'avatar');
    return { avatarUrl };
  }
}