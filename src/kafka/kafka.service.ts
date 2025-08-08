import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly topic = 'chat-messages';
  private messageHandlers: ((message: any) => void)[] = [];

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'chat-api',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'chat-api-consumer' });
    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const msg = payload.message.value?.toString();
        if (msg) {
          try {
            const data: unknown = JSON.parse(msg);
            // Optionally validate data here
            this.messageHandlers.forEach((handler) => handler(data));
          } catch (err) {
            console.error('Failed to parse Kafka message', err);
          }
        }
        return Promise.resolve();
      },
    });
  }

  async sendMessageToKafka(message: any) {
    await this.producer.send({
      topic: this.topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
  }
}
