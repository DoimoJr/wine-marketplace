import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ],
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly messagesService: MessagesService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract JWT token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      // In a real implementation, you would verify the JWT token here
      // For now, we'll simulate token validation
      const userId = await this.validateToken(token);
      
      if (!userId) {
        client.disconnect();
        return;
      }

      client.userId = userId;
      this.connectedUsers.set(userId, client.id);

      console.log(`User ${userId} connected to messages gateway`);
      
      // Join user-specific room for notifications
      client.join(`user:${userId}`);

      // Send unread message count
      const unreadCount = await this.messagesService.getUnreadMessageCount(userId);
      client.emit('unreadCount', { count: unreadCount });

    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected from messages gateway`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Not authenticated' };
      }

      const message = await this.messagesService.createMessage(client.userId, createMessageDto);

      // Emit to conversation participants
      if (message.conversationId) {
        // Get conversation participants
        const conversation = await this.getConversationParticipants(message.conversationId);
        
        for (const participantId of conversation.participantIds) {
          // Send to user's room
          this.server.to(`user:${participantId}`).emit('newMessage', {
            message,
            conversationId: message.conversationId,
          });
        }
      }

      return { success: true, message };
    } catch (error) {
      console.error('Send message error:', error);
      return { error: (error as Error).message };
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Not authenticated' };
      }

      const { conversationId } = data;
      
      // Verify user is part of conversation
      const conversation = await this.getConversationParticipants(conversationId);
      
      if (!conversation.participantIds.includes(client.userId)) {
        return { error: 'Not authorized to join this conversation' };
      }

      // Join conversation room
      client.join(`conversation:${conversationId}`);
      
      return { success: true, message: 'Joined conversation' };
    } catch (error) {
      console.error('Join conversation error:', error);
      return { error: (error as Error).message };
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { conversationId } = data;
    client.leave(`conversation:${conversationId}`);
    
    return { success: true, message: 'Left conversation' };
  }

  @SubscribeMessage('markMessageRead')
  async handleMarkMessageRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Not authenticated' };
      }

      await this.messagesService.markMessageAsRead(client.userId, data.messageId);

      // Send updated unread count
      const unreadCount = await this.messagesService.getUnreadMessageCount(client.userId);
      client.emit('unreadCount', { count: unreadCount });

      return { success: true, message: 'Message marked as read' };
    } catch (error) {
      console.error('Mark message read error:', error);
      return { error: (error as Error).message };
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      if (!client.userId) {
        return { error: 'Not authenticated' };
      }

      const unreadCount = await this.messagesService.getUnreadMessageCount(client.userId);
      return { count: unreadCount };
    } catch (error) {
      console.error('Get unread count error:', error);
      return { error: (error as Error).message };
    }
  }

  // Utility method to send notification to user
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // Utility method to send message to conversation
  async sendMessageToConversation(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('newMessage', message);
  }

  private async validateToken(token: string): Promise<string | null> {
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Check if user is valid and not banned
    
    // For now, we'll simulate this by extracting user ID from a simple format
    // This should be replaced with proper JWT validation
    try {
      // Simulated token validation - replace with real JWT validation
      if (token.startsWith('user-')) {
        return token.replace('user-', '');
      }
      return null;
    } catch {
      return null;
    }
  }

  private async getConversationParticipants(conversationId: string) {
    // This should query the database to get conversation participants
    // For now, returning a mock structure
    return {
      participantIds: [], // Array of user IDs
    };
  }
}