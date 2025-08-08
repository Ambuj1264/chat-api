import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { KafkaService } from '../kafka/kafka.service';

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly kafkaService: KafkaService,
  ) {}

  onModuleInit() {
    this.kafkaService.onMessage((msg) => {
      this.server.emit('newMessage', msg);
    });
  }

  handleConnection() {}
  handleDisconnect() {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: SendMessageDto) {
    // Save and broadcast message via Kafka
    return await this.chatService.sendMessage(data);
  }
}
