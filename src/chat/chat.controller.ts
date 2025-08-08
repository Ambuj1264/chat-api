import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return await this.chatService.sendMessage(sendMessageDto);
  }

  @Get('messages')
  getMessages(@Query('userId') userId: string) {
    return this.chatService.getMessages(userId);
  }
}
