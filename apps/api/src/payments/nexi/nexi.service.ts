import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/services/prisma.service';
import { OrderStatus, PaymentStatus } from '@wine-marketplace/shared';
import * as crypto from 'crypto';

@Injectable()
export class NexiService {
  private readonly logger = new Logger(NexiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async validateMacSignature(data: Record<string, any>): Promise<boolean> {
    try {
      const macKey = this.configService.get('NEXI_MAC_KEY');
      if (!macKey) {
        this.logger.error('NEXI_MAC_KEY not configured');
        return false;
      }

      const receivedMac = data.mac;
      if (!receivedMac) {
        this.logger.error('No MAC signature in callback data');
        return false;
      }

      // Calculate expected MAC
      const calculatedMac = this.generateMacSignature(data, macKey);
      const isValid = receivedMac.toUpperCase() === calculatedMac.toUpperCase();

      this.logger.log(`MAC validation: ${isValid ? 'VALID' : 'INVALID'}`, {
        received: receivedMac,
        calculated: calculatedMac,
      });

      return isValid;
    } catch (error) {
      this.logger.error('Error validating MAC signature', error);
      return false;
    }
  }

  private generateMacSignature(data: Record<string, any>, macKey: string): string {
    // Remove MAC field from data before calculating
    const { mac, ...dataWithoutMac } = data;

    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(dataWithoutMac).sort();

    // Concatenate key=value pairs
    const concatenated = sortedKeys
      .map(key => `${key}=${dataWithoutMac[key]}`)
      .join('') + macKey;

    // Calculate SHA1 hash
    return crypto.createHash('sha1').update(concatenated).digest('hex').toUpperCase();
  }

  async processCallback(callbackData: any): Promise<any> {
    const { orderId, esito, importo, codTrans, data: transactionDate } = callbackData;

    this.logger.log('Processing Nexi callback', {
      orderId,
      esito,
      importo,
      codTrans,
    });

    if (!orderId) {
      throw new BadRequestException('Missing orderId in callback');
    }

    // Find the order in database
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        seller: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!order) {
      throw new BadRequestException(`Order ${orderId} not found`);
    }

    // Process based on transaction result (esito)
    let newOrderStatus: OrderStatus;
    let newPaymentStatus: PaymentStatus;

    switch (esito) {
      case 'OK': // Payment successful
        newOrderStatus = OrderStatus.PAID;
        newPaymentStatus = PaymentStatus.COMPLETED;
        break;
      case 'KO': // Payment failed
        newOrderStatus = OrderStatus.CANCELLED;
        newPaymentStatus = PaymentStatus.FAILED;
        break;
      default:
        this.logger.warn(`Unknown esito value: ${esito}`);
        newOrderStatus = OrderStatus.CANCELLED;
        newPaymentStatus = PaymentStatus.FAILED;
    }

    // Update order in database
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newOrderStatus,
        paymentStatus: newPaymentStatus,
        paymentId: codTrans, // Nexi transaction code
        ...(transactionDate && { updatedAt: new Date(transactionDate) }),
      },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
      },
    });

    // If payment successful, mark wines as sold
    if (esito === 'OK') {
      await this.markWinesAsSold(updatedOrder.items);
    }

    this.logger.log(`Order ${orderId} updated`, {
      oldStatus: order.status,
      newStatus: newOrderStatus,
      oldPaymentStatus: order.paymentStatus,
      newPaymentStatus,
    });

    // TODO: Send email notifications to buyer and seller
    // await this.sendPaymentNotification(updatedOrder);

    return {
      orderId,
      status: newOrderStatus,
      paymentStatus: newPaymentStatus,
      transactionId: codTrans,
    };
  }

  private async markWinesAsSold(orderItems: any[]): Promise<void> {
    for (const item of orderItems) {
      const remainingQuantity = item.wine.quantity - item.quantity;

      await this.prisma.wine.update({
        where: { id: item.wine.id },
        data: {
          quantity: remainingQuantity,
          ...(remainingQuantity === 0 && {
            status: 'SOLD',
            soldAt: new Date()
          }),
        },
      });
    }
  }

  // Create payment request for Nexi
  async createPaymentRequest(orderId: string, amount: number): Promise<any> {
    const nexiAlias = this.configService.get('NEXI_ALIAS');
    const nexiMacKey = this.configService.get('NEXI_MAC_KEY');
    const nexiEnvironment = this.configService.get('NEXI_ENVIRONMENT', 'test');

    if (!nexiAlias || !nexiMacKey) {
      throw new BadRequestException('Nexi configuration missing');
    }

    const baseUrl = this.configService.get('WEB_URL', 'http://localhost:3000');
    const apiUrl = this.configService.get('API_URL', 'http://localhost:3010');

    // Prepare payment parameters
    const paymentParams = {
      alias: nexiAlias,
      importo: Math.round(amount * 100).toString(), // Amount in cents
      divisa: 'EUR',
      codTrans: orderId,
      url: `${apiUrl}/api/payments/nexi/callback`,
      url_back: `${baseUrl}/checkout/success`,
      urlpost: `${apiUrl}/api/payments/nexi/callback`,
      session_id: `SES_${Date.now()}`,
      descrizione: `Wine Marketplace Order ${orderId}`,
    };

    // Calculate MAC signature
    const mac = this.generateMacSignature(paymentParams, nexiMacKey);
    paymentParams['mac'] = mac;

    // Return payment URL and parameters
    const paymentUrl = nexiEnvironment === 'production'
      ? 'https://ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet'
      : 'https://int-ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet';

    return {
      paymentUrl,
      parameters: paymentParams,
      method: 'POST',
    };
  }
}