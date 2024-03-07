// http/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaCustomersRepository } from "../database/prisma/repositories/prisma-customers-repository";
import { PrismaProductsRepository } from "../database/prisma/repositories/prisma-products-repository";
import { PrismaPurchasesRepository } from "../database/prisma/repositories/prisma-purchases-repository";
import { PurchaseProduct } from "../../application/usecases/purchase-product";
import { RabbitMQMessagingAdapter } from "../messaging/rabbitmq/adapters/rabbitmq-messaging-adapter"; // Modificado

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.json({ ok: true });
});

app.post("/purchases", async (request, response) => {
  const { productId, name, email } = request.body;

  const prismaCustomersRepository = new PrismaCustomersRepository();
  const prismaProductsRepository = new PrismaProductsRepository();
  const prismaPurchasesRepository = new PrismaPurchasesRepository();
  const rabbitMQMessagingAdapter = new RabbitMQMessagingAdapter(
    process.env.RABBITMQ_URL || "amqp://localhost"
  ); // Adicionado

  const purchaseProductUseCase = new PurchaseProduct(
    prismaCustomersRepository,
    prismaProductsRepository,
    prismaPurchasesRepository,
    rabbitMQMessagingAdapter // Adicionado
  );

  try {
    await purchaseProductUseCase.execute({
      name,
      email,
      productId,
    });

    return response.status(201).send();
  } catch (err) {
    console.error(err);

    return response.status(400).json({
      error: "Error while creating a new purchase",
    });
  }
});

app.listen(process.env.PORT || 3333, () => {
  console.log("[Purchases] Server running");
});
