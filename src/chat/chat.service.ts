import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatMessage } from './interfaces/chat-message.interface';
import { KafkaService } from '../kafka/kafka.service';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class ChatService implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  onModuleInit() {
    this.kafkaService.onMessage((msg: ChatMessage) => {
      this.saveMessage(msg).catch((err) => {
        console.error('Failed to save message to MongoDB', err);
      });
    });
  }

  async sendMessage(
    sendMessageDto: SendMessageDto,
  ): Promise<{ status: string }> {
    const message: ChatMessage = {
      ...sendMessageDto,
      timestamp: sendMessageDto.timestamp || Date.now(),
    };
    await this.kafkaService.sendMessageToKafka(message);
    return { status: 'Message sent (queued)' };
  }

  private async saveMessage(message: ChatMessage): Promise<void> {
    await this.messageModel.create(message);
  }

  async getMessages(userId: string): Promise<ChatMessage[]> {
    return this.messageModel
      .find({
        $or: [{ senderId: userId }, { recipientId: userId }],
      })
      .sort({ timestamp: 1 })
      .lean();
  }
}
