// rabbitmq-messaging-adapter.ts
import { MessagingAdapter } from "../../../../application/adapters/messaging-adapter";
import { RabbitMQServer } from "../rabbitmqserver";

export class RabbitMQMessagingAdapter implements MessagingAdapter {
  private rabbitMQServer: RabbitMQServer;

  constructor(url: string) {
    this.rabbitMQServer = new RabbitMQServer(url);
    this.rabbitMQServer.start();
  }

  async sendMessage(queue: string, message: any) {
    await this.rabbitMQServer.publish(queue, message);
  }
}
