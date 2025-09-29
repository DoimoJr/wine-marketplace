import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentStatus } from '@wine-marketplace/shared';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables directly from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  async processPayment(
    orderId: string,
    amount: number,
    paymentProvider: PaymentProvider,
    paymentData: any,
  ) {
    switch (paymentProvider) {
      case PaymentProvider.PAYPAL:
        return this.processPayPalPayment(orderId, amount, paymentData);
      case PaymentProvider.STRIPE:
        return this.processStripePayment(orderId, amount, paymentData);
      case PaymentProvider.ESCROW:
        return this.processEscrowPayment(orderId, amount, paymentData);
      case PaymentProvider.NEXI_PAY:
        return this.processNexiPayment(orderId, amount, paymentData);
      default:
        throw new BadRequestException('Unsupported payment provider');
    }
  }

  async refundPayment(
    paymentId: string,
    amount: number,
    paymentProvider: PaymentProvider,
  ) {
    switch (paymentProvider) {
      case PaymentProvider.PAYPAL:
        return this.refundPayPalPayment(paymentId, amount);
      case PaymentProvider.STRIPE:
        return this.refundStripePayment(paymentId, amount);
      case PaymentProvider.ESCROW:
        return this.refundEscrowPayment(paymentId, amount);
      case PaymentProvider.NEXI_PAY:
        return this.refundNexiPayment(paymentId, amount);
      default:
        throw new BadRequestException('Unsupported payment provider');
    }
  }

  private async processPayPalPayment(orderId: string, amount: number, paymentData: any) {
    // PayPal API integration
    try {
      // This would integrate with PayPal SDK
      // For now, we'll simulate the payment processing
      
      console.log(`Processing PayPal payment for order ${orderId}, amount: ${amount}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would:
      // 1. Validate the payment with PayPal
      // 2. Capture the payment
      // 3. Handle webhooks for payment confirmation
      
      return {
        success: true,
        transactionId: `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: PaymentStatus.COMPLETED,
        amount,
        fees: amount * 0.029, // PayPal fee simulation
        provider: PaymentProvider.PAYPAL,
      };
    } catch (error) {
      console.error('PayPal payment failed:', error);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        error: (error as Error).message,
        provider: PaymentProvider.PAYPAL,
      };
    }
  }

  private async processStripePayment(orderId: string, amount: number, paymentData: any) {
    // Stripe API integration
    try {
      console.log(`Processing Stripe payment for order ${orderId}, amount: ${amount}`);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        transactionId: `ST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: PaymentStatus.COMPLETED,
        amount,
        fees: amount * 0.029 + 0.30, // Stripe fee simulation
        provider: PaymentProvider.STRIPE,
      };
    } catch (error) {
      console.error('Stripe payment failed:', error);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        error: (error as Error).message,
        provider: PaymentProvider.STRIPE,
      };
    }
  }

  private async processEscrowPayment(orderId: string, amount: number, paymentData: any) {
    // Escrow service integration (for future implementation)
    try {
      console.log(`Processing Escrow payment for order ${orderId}, amount: ${amount}`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        transactionId: `ESC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: PaymentStatus.PENDING, // Escrow payments are typically pending until delivery
        amount,
        fees: amount * 0.025, // Lower fees for escrow
        provider: PaymentProvider.ESCROW,
      };
    } catch (error) {
      console.error('Escrow payment failed:', error);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        error: (error as Error).message,
        provider: PaymentProvider.ESCROW,
      };
    }
  }

  private async refundPayPalPayment(paymentId: string, amount: number) {
    try {
      console.log(`Processing PayPal refund for payment ${paymentId}, amount: ${amount}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        refundId: `PPR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: PaymentStatus.REFUNDED,
        amount,
        provider: PaymentProvider.PAYPAL,
      };
    } catch (error) {
      console.error('PayPal refund failed:', error);
      return {
        success: false,
        error: (error as Error).message,
        provider: PaymentProvider.PAYPAL,
      };
    }
  }

  private async refundStripePayment(paymentId: string, amount: number) {
    try {
      console.log(`Processing Stripe refund for payment ${paymentId}, amount: ${amount}`);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        refundId: `STR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: PaymentStatus.REFUNDED,
        amount,
        provider: PaymentProvider.STRIPE,
      };
    } catch (error) {
      console.error('Stripe refund failed:', error);
      return {
        success: false,
        error: (error as Error).message,
        provider: PaymentProvider.STRIPE,
      };
    }
  }

  private async refundEscrowPayment(paymentId: string, amount: number) {
    try {
      console.log(`Processing Escrow refund for payment ${paymentId}, amount: ${amount}`);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        success: true,
        refundId: `ESCR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: PaymentStatus.REFUNDED,
        amount,
        provider: PaymentProvider.ESCROW,
      };
    } catch (error) {
      console.error('Escrow refund failed:', error);
      return {
        success: false,
        error: (error as Error).message,
        provider: PaymentProvider.ESCROW,
      };
    }
  }

  private async processNexiPayment(orderId: string, amount: number, paymentData: any) {
    // Nexi Pay API integration
    console.log('🚨 DEBUG: processNexiPayment called!', { orderId, amount, paymentData });
    try {
      console.log(`Processing Nexi Pay payment for order ${orderId}, amount: ${amount}`);

      // Force reload environment variables from project root
      require('dotenv').config({ path: path.join(process.cwd(), '../../.env') });

      // Debug environment variable access
      console.log('🔍 Environment variables debug:', {
        configServiceAlias: this.configService.get('NEXI_ALIAS'),
        processEnvAlias: process.env.NEXI_ALIAS,
        configServiceMacKey: this.configService.get('NEXI_MAC_KEY') ? 'FOUND' : 'NOT_FOUND',
        processEnvMacKey: process.env.NEXI_MAC_KEY ? 'FOUND' : 'NOT_FOUND',
        allNexiKeys: Object.keys(process.env).filter(k => k.includes('NEXI'))
      });

      // Get Nexi configuration from environment (with fallback to process.env)
      const nexiAlias = this.configService.get('NEXI_ALIAS') || process.env.NEXI_ALIAS;
      const nexiMacKey = this.configService.get('NEXI_MAC_KEY') || process.env.NEXI_MAC_KEY;
      const nexiTerminalId = this.configService.get('NEXI_TERMINAL_ID') || process.env.NEXI_TERMINAL_ID;
      const nexiEnvironment = this.configService.get('NEXI_ENVIRONMENT', 'test') || process.env.NEXI_ENVIRONMENT || 'test';
      const nexiGroupId = this.configService.get('NEXI_GROUP_ID') || process.env.NEXI_GROUP_ID;

      console.log('🔧 Final extracted values:', {
        alias: nexiAlias ? 'FOUND' : 'NOT_FOUND',
        macKey: nexiMacKey ? 'FOUND' : 'NOT_FOUND',
        terminalId: nexiTerminalId ? 'FOUND' : 'NOT_FOUND',
        environment: nexiEnvironment,
        groupId: nexiGroupId ? 'FOUND' : 'NOT_FOUND'
      });

      if (!nexiAlias || !nexiMacKey) {
        throw new Error('Nexi Pay configuration missing. Check NEXI_ALIAS and NEXI_MAC_KEY in environment variables.');
      }

      console.log('🔧 Using Nexi configuration:', {
        alias: nexiAlias,
        terminalId: nexiTerminalId,
        environment: nexiEnvironment,
        groupId: nexiGroupId,
        macKeyPresent: !!nexiMacKey
      });

      // Create unique transaction ID for Nexi (max 30 chars)
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
      const orderShort = orderId.slice(-8); // Last 8 chars of order ID
      const nexiOrderId = `NX${timestamp}${orderShort}`; // Format: NXnnnnnnnnxxxxxxxx (18 chars)
      const currencyCode = 'EUR'; // Currency as string like in Nexi Java example
      const language = 'ITA';

      // Base URL depending on environment
      const baseUrl = nexiEnvironment === 'production'
        ? 'https://ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet'
        : 'https://int-ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet';

      // Callback URLs
      const baseCallbackUrl = this.configService.get('BASE_URL') || process.env.BASE_URL || 'http://localhost:3000';
      const successUrl = `${baseCallbackUrl}/payment/success`;
      const errorUrl = `${baseCallbackUrl}/payment/error`;
      const cancelUrl = `${baseCallbackUrl}/payment/cancel`;

      // Parameters for MAC signature generation (order matters for MAC calculation)
      const params = {
        alias: nexiAlias,
        importo: Math.round(amount * 100).toString(), // Amount in cents
        divisa: currencyCode,
        codTrans: nexiOrderId,
        url: successUrl,
        url_back: errorUrl,
        url_post: `${this.configService.get('NEXT_PUBLIC_API_URL') || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'}/payments/nexi/callback`,
        languageId: language
      };

      // Add optional parameters if available (these are added after base params for correct MAC)
      if (nexiTerminalId) {
        params['TERMINAL_ID'] = nexiTerminalId;
      }
      if (nexiGroupId) {
        params['group'] = nexiGroupId;
      }

      // Generate MAC signature
      const mac = this.generateNexiMac(params, nexiMacKey);
      params['mac'] = mac;

      // Create payment URL
      const paymentUrl = `${baseUrl}?${Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')}`;

      console.log('🔗 Generated Nexi payment URL with parameters:', {
        nexiOrderId,
        codTransLength: nexiOrderId.length,
        amount: params.importo,
        currency: params.divisa,
        macGenerated: !!mac,
        allParams: Object.keys(params),
        fullUrl: paymentUrl.substring(0, 150) + '...'
      });

      // Return payment details for frontend redirect
      // Note: Payment is PENDING until callback confirms it
      return {
        success: true,
        transactionId: nexiOrderId,
        status: PaymentStatus.PENDING, // Changed from COMPLETED to PENDING
        amount,
        fees: amount * 0.018, // Nexi fee estimation
        provider: PaymentProvider.NEXI_PAY,
        redirectUrl: paymentUrl, // Real Nexi payment URL
        nexiOrderId,
        environment: nexiEnvironment,
        requiresRedirect: true // Flag to indicate frontend should redirect
      };
    } catch (error) {
      console.error('Nexi Pay payment failed:', error);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        error: (error as Error).message,
        provider: PaymentProvider.NEXI_PAY,
      };
    }
  }

  private async refundNexiPayment(paymentId: string, amount: number) {
    try {
      console.log(`Processing Nexi Pay refund for payment ${paymentId}, amount: ${amount}`);

      // Get Nexi configuration
      const nexiAlias = this.configService.get('NEXI_ALIAS') || process.env.NEXI_ALIAS;
      const nexiMacKey = this.configService.get('NEXI_MAC_KEY') || process.env.NEXI_MAC_KEY;

      if (!nexiAlias || !nexiMacKey) {
        throw new Error('Nexi Pay configuration missing for refund');
      }

      // In real implementation, this would:
      // 1. Create refund request with MAC signature
      // 2. Call Nexi refund API
      // 3. Validate response and MAC signature

      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        refundId: `NEXIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: PaymentStatus.REFUNDED,
        amount,
        provider: PaymentProvider.NEXI_PAY,
        originalPaymentId: paymentId,
      };
    } catch (error) {
      console.error('Nexi Pay refund failed:', error);
      return {
        success: false,
        error: (error as Error).message,
        provider: PaymentProvider.NEXI_PAY,
      };
    }
  }

  // Utility method for generating Nexi Pay MAC signature
  private generateNexiMac(data: Record<string, string>, macKey: string): string {
    // Nexi MAC generation follows specific rules:
    // 1. Exclude 'mac' parameter if present
    // 2. Sort parameters alphabetically by key
    // 3. Concatenate key=value pairs (no separators)
    // 4. Append MAC key at the end
    // 5. Calculate SHA1 hash and convert to uppercase hex
    const crypto = require('crypto');

    // Remove mac parameter if present and sort keys
    const filteredData = { ...data };
    delete filteredData.mac; // Don't include mac in MAC calculation

    const sortedKeys = Object.keys(filteredData).sort();
    // Fixed: Use only codTrans, divisa, importo as per Nexi's official Java example
    const concatenated = `codTrans=${data.codTrans}divisa=${data.divisa}importo=${data.importo}${macKey}`;

    const sha1Hash = crypto.createHash('sha1').update(concatenated, 'utf8').digest('hex').toLowerCase();

    console.log('🔐 MAC generation debug (FIXED):', {
      codTrans: data.codTrans,
      divisa: data.divisa,
      importo: data.importo,
      concatenatedString: concatenated,
      concatenatedLength: concatenated.length,
      hashGenerated: sha1Hash,
      macKeyLength: macKey.length
    });

    return sha1Hash;
  }

  async generateShippingLabel(orderId: string, shippingAddress: any) {
    // This would integrate with shipping providers like DHL, BRT, etc.
    try {
      console.log(`Generating shipping label for order ${orderId}`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate label generation
      const trackingNumber = `TN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const labelUrl = `https://labels.example.com/${orderId}_${trackingNumber}.pdf`;

      return {
        success: true,
        trackingNumber,
        labelUrl,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        carrier: 'Poste Italiane', // Default carrier
        cost: 8.50, // Shipping cost
      };
    } catch (error) {
      console.error('Shipping label generation failed:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}