export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export class ConversationManager {
  private messages: Message[];
  private maxMessages: number;

  constructor(initialMessage?: Message, maxMessages: number = 20) {
    this.messages = [];
    this.maxMessages = maxMessages;
    if (initialMessage) {
      this.messages.push(initialMessage);
    }
  }

  addUserMessage(content: string) {
    this.messages.push({ role: 'user', content });
    this.trimMessages();
  }

  addAssistantMessage(content: string) {
    this.messages.push({ role: 'assistant', content });
    this.trimMessages();
  }

  getMessages(): Message[] {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }

  private trimMessages() {
    // @TODO; We need to summarize older messages instead of just removing them
    // This is a naive implementation that just removes the oldest messages
    while (this.messages.length > this.maxMessages) {
      if (this.messages[0].role === 'system') {
        this.messages.splice(1, 1);
      } else {
        this.messages.shift();
      }
    }
  }
}
