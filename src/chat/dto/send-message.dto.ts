export class SendMessageDto {
  senderId: string;
  recipientId: string;
  content: string;
  timestamp?: number;
}
