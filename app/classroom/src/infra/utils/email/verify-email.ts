import { RabbitMQServer } from "../../messaging/rabbitmq/rabbitmqserver"; // Import RabbitMQServer class
import EmailSender from "./index"; // Import EmailSender class

// Instantiate RabbitMQServer and EmailSender
const rabbitMQServer = new RabbitMQServer("amqp://localhost");
const emailSender = new EmailSender();

// Start RabbitMQ server connection
rabbitMQServer
  .start()
  .then(async () => {
    console.log("RabbitMQ server started successfully.");

    // Define queue and bind callback function to consume messages for sending emails
    const emailQueueName = "send.email";
    rabbitMQServer.consume(emailQueueName, async (msg: any) => {
      if (msg) {
        try {
          // Parse message content
          const messageContent = JSON.parse(msg.content.toString());

          // Call EmailSender to send email
          await emailSender.sendMail(messageContent);

          // Acknowledge message to remove it from the queue
          rabbitMQServer.getChannel().ack(msg);
        } catch (error) {
          console.error("Error processing email message:", error);
          // Reject message if an error occurs
          rabbitMQServer.getChannel().nack(msg);
        }
      }
    });

    // Define queue and bind callback function to consume messages for sending purchase notifications
    const purchaseQueueName = "purchases.enrolled";
    rabbitMQServer.consume(purchaseQueueName, async (msg: any) => {
      if (msg) {
        try {
          // Parse message content
          const messageContent = JSON.parse(msg.content.toString());

          // Call EmailSender to send purchase notification email
          await emailSender.sendMail(messageContent);

          // Acknowledge message to remove it from the queue
          rabbitMQServer.getChannel().ack(msg);
        } catch (error) {
          console.error(
            "Error processing purchase notification message:",
            error
          );
          // Reject message if an error occurs
          rabbitMQServer.getChannel().nack(msg);
        }
      }
    });
  })
  .catch((error: any) => {
    console.error("Error starting RabbitMQ server:", error);
  });

export function isValidEmail(email: string): boolean {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
