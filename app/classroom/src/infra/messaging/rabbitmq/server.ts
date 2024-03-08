import { RabbitMQServer } from "./rabbitmqserver";

(async () => {
  const rabbitMQServer = new RabbitMQServer("amqp://localhost");

  await rabbitMQServer.start();

  rabbitMQServer.consume("purchases.new-purchase", (msg) => {
    if (msg) {
      console.log("Mensagem recebida:", msg.content.toString());
    }
  });

  rabbitMQServer.consume("send.email", (msg) => {
    if (msg) {
      console.log("Mensagem recebida: send.email", msg.content.toString());
    }
  });
})();
