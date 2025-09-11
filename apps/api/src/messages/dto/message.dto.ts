import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsUUID,
  MaxLength 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '@wine-marketplace/shared';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, I am interested in your Barolo wine. Is it still available?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Message cannot be longer than 1000 characters' })
  content: string;

  @ApiPropertyOptional({
    description: 'Conversation ID (for existing conversations)',
    example: 'clxxx-conversation-id-xxxx',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Order ID (for order-related messages)',
    example: 'clxxx-order-id-xxxx',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiPropertyOptional({
    description: 'Recipient user ID (for new conversations)',
    example: 'clxxx-user-id-xxxx',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  recipientId?: string;
}

export class CreateConversationDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: 'clxxx-user-id-xxxx',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;

  @ApiProperty({
    description: 'Initial message content',
    example: 'Hello, I am interested in your Barolo wine.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Message cannot be longer than 1000 characters' })
  initialMessage: string;

  @ApiPropertyOptional({
    description: 'Related order ID',
    example: 'clxxx-order-id-xxxx',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  orderId?: string;
}

export class MarkMessageReadDto {
  @ApiProperty({
    description: 'Message ID to mark as read',
    example: 'clxxx-message-id-xxxx',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  messageId: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'clxxx-message-id-xxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, I am interested in your wine.',
  })
  content: string;

  @ApiProperty({
    description: 'Sender information',
    type: 'object',
  })
  sender: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
  })
  messageType: MessageType;

  @ApiPropertyOptional({
    description: 'Read timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  readAt?: Date;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Related conversation ID',
  })
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Related order ID',
  })
  orderId?: string;
}

export class ConversationResponseDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'clxxx-conversation-id-xxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Other participant in conversation',
    type: 'object',
  })
  otherParticipant: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    verified: boolean;
  };

  @ApiPropertyOptional({
    description: 'Last message in conversation',
    type: MessageResponseDto,
  })
  lastMessage?: MessageResponseDto;

  @ApiProperty({
    description: 'Number of unread messages',
    example: 2,
  })
  unreadCount: number;

  @ApiProperty({
    description: 'Conversation creation timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Conversation last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}