import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { NexiService } from './nexi.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Nexi Payments')
@Controller('payments/nexi')
export class NexiController {
  private readonly logger = new Logger(NexiController.name);

  constructor(private readonly nexiService: NexiService) {}

  @Post('callback')
  @Public() // Questo endpoint deve essere pubblico per ricevere callback da Nexi
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Nexi Pay callback notifications via POST' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid callback data or MAC signature' })
  async handleCallback(@Body() callbackData: any, @Req() request: Request) {
    return this.processCallback(callbackData, request, 'POST');
  }

  @Get('callback')
  @Public() // Questo endpoint deve essere pubblico per ricevere callback da Nexi
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Nexi Pay callback notifications via GET' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid callback data or MAC signature' })
  async handleCallbackGet(@Query() callbackData: any, @Req() request: Request) {
    return this.processCallback(callbackData, request, 'GET');
  }

  private async processCallback(callbackData: any, request: Request, method: string) {
    this.logger.log(`🔔 Received Nexi callback via ${method}`, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      data: callbackData,
    });

    try {
      // Validate MAC signature
      const isValidMac = await this.nexiService.validateMacSignature(callbackData);
      if (!isValidMac) {
        this.logger.error('❌ Invalid MAC signature in Nexi callback', callbackData);
        throw new BadRequestException('Invalid MAC signature');
      }

      // Process the callback
      const result = await this.nexiService.processCallback(callbackData);

      this.logger.log('✅ Nexi callback processed successfully', {
        transactionId: callbackData.codTrans,
        result,
      });

      return { success: true, message: 'Callback processed successfully' };
    } catch (error) {
      this.logger.error('❌ Error processing Nexi callback', {
        error: error.message,
        data: callbackData,
      });

      // Always return 200 to Nexi to avoid retries on validation errors
      return { success: false, error: error.message };
    }
  }

  @Post('success')
  @Public()
  @ApiOperation({ summary: 'Handle successful payment redirect from Nexi' })
  @ApiResponse({ status: 200, description: 'Success page redirect handled' })
  async handleSuccess(@Body() successData: any) {
    this.logger.log('✅ Nexi success redirect received', successData);

    try {
      // Validate and process success redirect
      const isValidMac = await this.nexiService.validateMacSignature(successData);
      if (!isValidMac) {
        throw new BadRequestException('Invalid MAC signature');
      }

      // Return redirect URL for frontend
      return {
        success: true,
        redirectUrl: '/orders?success=true',
        orderId: successData.orderId,
      };
    } catch (error) {
      this.logger.error('❌ Error processing Nexi success', error);
      return {
        success: false,
        redirectUrl: '/checkout?error=payment_failed',
        error: error.message,
      };
    }
  }

  @Post('error')
  @Public()
  @ApiOperation({ summary: 'Handle failed payment redirect from Nexi' })
  @ApiResponse({ status: 200, description: 'Error page redirect handled' })
  async handleError(@Body() errorData: any) {
    this.logger.log('❌ Nexi error redirect received', errorData);

    return {
      success: false,
      redirectUrl: '/checkout?error=payment_failed',
      error: errorData.error || 'Payment failed',
    };
  }

  @Post('cancel')
  @Public()
  @ApiOperation({ summary: 'Handle cancelled payment redirect from Nexi' })
  @ApiResponse({ status: 200, description: 'Cancel page redirect handled' })
  async handleCancel(@Body() cancelData: any) {
    this.logger.log('⚠️ Nexi cancel redirect received', cancelData);

    return {
      success: false,
      redirectUrl: '/cart',
      message: 'Payment cancelled by user',
    };
  }
}