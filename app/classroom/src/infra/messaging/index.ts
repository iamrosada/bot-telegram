import * as dotenv from "dotenv";
import { EnrollStudentToCourse } from "../../application/usecases/enroll-student-to-course";
import { PrismaCoursesRepository } from "../database/prisma/repositories/prisma-courses-repository";
import { PrismaEnrollmentsRepository } from "../database/prisma/repositories/prisma-enrollments-repository";
import { PrismaStudentsRepository } from "../database/prisma/repositories/prisma-students-repository";
import { RabbitMQServer } from "./rabbitmq/rabbitmqserver";
import { Channel } from "amqplib";
import EmailSender from "../utils/email";

dotenv.config();

interface PurchasesNewPurchaseMessage {
  product: {
    id: string;
    title: string;
  };
  customer: {
    name: string;
    email: string;
  };
  purchaseId: string;
}

async function mainEmail(
  channel: Channel,
  emailQueueName: string,
  emailSender: EmailSender,
  rabbitMQServer: RabbitMQServer
) {
  // Consume messages from the email queue
  channel.consume(emailQueueName, async (msg: any) => {
    if (msg) {
      try {
        // Parse message content
        const messageContent = JSON.parse(msg.content.toString());

        // Call EmailSender to send email
        await emailSender.sendMail(messageContent);

        // Acknowledge message to remove it from the queue
        channel.ack(msg);
      } catch (error) {
        console.error("Error processing email message:", error);
        // Reject message if an error occurs
        channel.nack(msg);
      }
    }
  });
}
async function ensureQueueExists(
  channel: Channel,
  queueName: string
): Promise<void> {
  try {
    await channel.assertQueue(queueName);
    console.log(`Queue '${queueName}' exists or has been created.`);
  } catch (error) {
    console.error(`Error ensuring queue '${queueName}' exists:`, error);
  }
}
async function main() {
  const rabbitMQServer = new RabbitMQServer(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  await rabbitMQServer.start();
  const channel = rabbitMQServer.getChannel();
  await ensureQueueExists(channel, "send.email");
  const queueName = "purchases.new-purchase";
  const exchangeName = "custom-exchange"; // Nome da troca personalizada

  await channel.assertQueue(queueName);
  await channel.assertExchange(exchangeName, "direct", { durable: true });
  await channel.bindQueue(queueName, exchangeName, "");

  await channel.consume(queueName, async (msg) => {
    if (msg === null) {
      return;
    }

    const purchaseJSON = msg.content.toString();
    const purchase: PurchasesNewPurchaseMessage = JSON.parse(purchaseJSON);

    const prismaStudentsRepository = new PrismaStudentsRepository();
    const prismaCourseRepository = new PrismaCoursesRepository();
    const prismaEnrollmentRepository = new PrismaEnrollmentsRepository();

    const enrollStudentToCourse = new EnrollStudentToCourse(
      prismaStudentsRepository,
      prismaCourseRepository,
      prismaEnrollmentRepository
    );

    await enrollStudentToCourse.execute({
      student: {
        name: purchase.customer.name,
        email: purchase.customer.email,
      },
      course: {
        title: purchase.product.title,
        purchasesProductId: purchase.product.id,
      },
      purchasesEnrolledByPurchaseId: purchase.purchaseId,
    });

    console.log(
      `[Classroom] Enrolled user ${purchase.customer.name} to ${purchase.product.title}`
    );

    channel.ack(msg);
  });

  console.log("[Classroom] Listening to RabbitMQ messages");

  // Define email queue name and instantiate EmailSender
  const emailQueueName = "send.email";
  const emailSender = new EmailSender();

  await mainEmail(channel, emailQueueName, emailSender, rabbitMQServer);
}

main().catch((error) => {
  console.error("Error:", error);
});
