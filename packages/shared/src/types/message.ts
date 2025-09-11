import { MessageType } from './enums';
import { User } from './user';

export interface Message {
  id: string;
  content: string;
  sender: User;
  messageType: MessageType;
  readAt?: Date;
  createdAt: Date;
  conversationId?: string;
  orderId?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageRequest {
  content: string;
  conversationId?: string;
  orderId?: string;
  messageType?: MessageType;
}

export interface ConversationPreview {
  id: string;
  otherParticipant: User;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

