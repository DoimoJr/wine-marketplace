import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import {
  CreateMessageDto,
  CreateConversationDto,
  MarkMessageReadDto,
  MessageResponseDto,
  ConversationResponseDto,
} from './dto/message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid conversation data' })
  create(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.messagesService.createConversation(user.id, createConversationDto);
  }

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid message data' })
  @ApiResponse({ status: 403, description: 'Not authorized to send message to this conversation' })
  sendMessage(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: any): Promise<any> {
    return this.messagesService.createMessage(user.id, createMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully', type: [ConversationResponseDto] })
  getConversations(@CurrentUser() user: any): Promise<any> {
    return this.messagesService.getConversations(user.id);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Get messages from a conversation' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Messages per page' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to access this conversation' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  getConversationMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.messagesService.getConversationMessages(user.id, conversationId, page, limit);
  }

  @Post('read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read successfully' })
  @ApiResponse({ status: 400, description: 'Cannot mark own message as read' })
  @ApiResponse({ status: 403, description: 'Not authorized to mark this message as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  markAsRead(@Body() markMessageReadDto: MarkMessageReadDto, @CurrentUser() user: any): Promise<any> {
    return this.messagesService.markMessageAsRead(user.id, markMessageReadDto.messageId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  getUnreadCount(@CurrentUser() user: any): Promise<any> {
    return this.messagesService.getUnreadMessageCount(user.id);
  }

  @Delete(':messageId')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete your own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  deleteMessage(@Param('messageId') messageId: string, @CurrentUser() user: any): Promise<any> {
    return this.messagesService.deleteMessage(user.id, messageId);
  }
}