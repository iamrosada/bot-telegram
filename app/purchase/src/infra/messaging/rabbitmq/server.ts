import { RabbitMQServer } from "./rabbitmqserver";

(async () => {
  const rabbitMQServer = new RabbitMQServer("amqp://localhost");

  await rabbitMQServer.start();

  rabbitMQServer.publish("telegram-message", "message");
})();
