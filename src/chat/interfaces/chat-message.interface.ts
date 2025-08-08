export interface ChatMessage {
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
}
