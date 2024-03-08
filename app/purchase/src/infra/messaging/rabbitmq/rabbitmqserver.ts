import { connect, Channel, Connection, Message } from "amqplib";

class RabbitMQServer {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async start(): Promise<void> {
    try {
      this.connection = await connect(this.url);
      this.channel = await this.connection.createChannel();
      console.log("Connected to RabbitMQ server.");
    } catch (error) {
      console.error("Error connecting to RabbitMQ server:", error);
      throw error; // Propagate the error for handling outside
    }
  }

  // async publish(queue: string, message: string) {
  //   return this.channel?.sendToQueue(queue, Buffer.from(message));
  // }
  async publish(queue: string, message: any) {
    const bufferMessage = Buffer.from(JSON.stringify(message));
    return this.channel?.sendToQueue(queue, bufferMessage);
  }

  async consume(queue: string, callback: (msg: Message | null) => void) {
    await this.channel?.assertQueue(queue);
    await this.channel?.consume(queue, (msg) => {
      callback(msg);
      // Acknowledge the message to remove it from the queue
      if (msg) {
        this.channel?.ack(msg);
      }
    });
  }

  async stop(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
        console.log("Disconnected from RabbitMQ server.");
      }
    } catch (error) {
      console.error("Error while disconnecting from RabbitMQ server:", error);
      throw error; // Propagate the error for handling outside
    }
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call start() method first.");
    }
    return this.channel;
  }
}

export { RabbitMQServer };
