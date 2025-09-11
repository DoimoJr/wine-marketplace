import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateMessageDto, CreateConversationDto } from './dto/message.dto';
import { MessageType } from '@wine-marketplace/shared';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(userId: string, createConversationDto: CreateConversationDto): Promise<any> {
    const { recipientId, initialMessage, orderId } = createConversationDto;

    if (recipientId === userId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Check if recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, banned: true },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    if (recipient.banned) {
      throw new BadRequestException('Cannot message banned users');
    }

    // Check if conversation already exists
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: [userId, recipientId] },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                verified: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      // Add message to existing conversation
      const message = await this.createMessage(userId, {
        content: initialMessage,
        conversationId: existingConversation.id,
        orderId,
        messageType: MessageType.TEXT,
      });

      return {
        conversation: existingConversation,
        message,
      };
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: recipientId },
          ],
        },
        messages: {
          create: {
            content: initialMessage,
            senderId: userId,
            messageType: MessageType.TEXT,
            orderId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                verified: true,
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return conversation;
  }

  async createMessage(userId: string, createMessageDto: CreateMessageDto): Promise<any> {
    const { content, conversationId, orderId, messageType = MessageType.TEXT, recipientId } = createMessageDto;

    let targetConversationId = conversationId;

    // If no conversation ID provided but recipient ID is provided, find or create conversation
    if (!targetConversationId && recipientId) {
      const conversation = await this.createConversation(userId, {
        recipientId,
        initialMessage: content,
        orderId,
      });
      return conversation.messages[0]; // Return the message from the created conversation
    }

    if (!targetConversationId) {
      throw new BadRequestException('Either conversationId or recipientId must be provided');
    }

    // Verify user is part of the conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: targetConversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId: targetConversationId,
        messageType,
        orderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: targetConversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getConversations(userId: string): Promise<any> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                verified: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform to include other participant and unread count
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipant = conversation.participants.find(p => p.userId !== userId);
        
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            readAt: null,
          },
        });

        return {
          id: conversation.id,
          otherParticipant: otherParticipant?.user,
          lastMessage: conversation.messages[0],
          unreadCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    return conversationsWithUnreadCount;
  }

  async getConversationMessages(userId: string, conversationId: string, page = 1, limit = 50): Promise<any> {
    // Verify user is part of the conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.message.count({
        where: { conversationId },
      }),
    ]);

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return {
      messages: messages.reverse(), // Show oldest first
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markMessageAsRead(userId: string, messageId: string): Promise<any> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is a participant in the conversation
    const isParticipant = message.conversation?.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not authorized to mark this message as read');
    }

    // Don't allow marking own messages as read
    if (message.senderId === userId) {
      throw new BadRequestException('Cannot mark your own message as read');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });

    return { message: 'Message marked as read' };
  }

  async getUnreadMessageCount(userId: string): Promise<any> {
    return this.prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: { userId },
          },
        },
        senderId: { not: userId },
        readAt: null,
      },
    });
  }

  async deleteMessage(userId: string, messageId: string): Promise<any> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: {
        senderId: true,
        conversationId: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    return { message: 'Message deleted successfully' };
  }
}