// http/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaCustomersRepository } from "../database/prisma/repositories/prisma-customers-repository";
import { PrismaProductsRepository } from "../database/prisma/repositories/prisma-products-repository";
import { PurchaseProduct } from "../../application/usecases/purchase-product";
import { RabbitMQMessagingAdapter } from "../messaging/rabbitmq/adapters/rabbitmq-messaging-adapter";
import { prisma } from "../database/prisma/prisma";
import { Telegraf, Context } from "telegraf";
import { PrismaPurchasesRepository } from "../database/prisma/repositories/prisma-purchases-repository";

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.post("/purchases", handlePurchase);

app.post("/products", handleCreateProduct);

// Helper function to handle purchase
async function handlePurchase(req: express.Request, res: express.Response) {
  const { productId, name, email } = req.body;

  // Repositories
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
    await purchaseProductUseCase.execute({ name, email, productId });
    res.status(201).send();
  } catch (error) {
    console.error("Error creating purchase:", error);
    res.status(400).json({ error: "Error while creating a new purchase" });
  }
}

// Helper function to handle product creation
async function handleCreateProduct(
  req: express.Request,
  res: express.Response
) {
  try {
    const { title } = req.body;
    const prismaProductsRepository = new PrismaProductsRepository();
    const newProduct = await prismaProductsRepository.create(title);
    if (newProduct) {
      res.status(201).json(newProduct);
    } else {
      res.status(500).json({ error: "Failed to create product" });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Bot initialization

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || "");

bot.use(handleBotMessages);

// Helper function to handle bot messages
async function greetUser(ctx: Context) {
  ctx.reply("Hello! Please send 'hello' to start.");
  ctx.replyWithSticker(
    "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
  ); // Adicione o ID do arquivo do sticker aqui

  const user = await prisma.user.findUnique({
    where: { idTelegram: ctx.from?.id.toString() },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        idTelegram: ctx.from?.id.toString() as any,
        userName: ctx.from?.username || "",
        fullName: `${ctx.from?.first_name || ""} ${ctx.from?.last_name || ""}`,
        plan: {
          create: {
            name: "Free",
          },
        },
      },
    });
  }
}
async function handleBotMessages(ctx: Context, next: () => void) {
  await greetUser(ctx);
  await handleUserOptions(ctx);
  await next(); // Chama o próximo middleware ou manipulador de rota do Express
}
async function handleUserOptions(ctx: Context) {
  bot.hears("hello", async (ctx: Context) => {
    await ctx.reply("Great! Choose an option:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Choose Plan", callback_data: "choose_plan" },
            { text: "Free Option", callback_data: "free_option" },
          ],
        ],
      },
    });
  });

  bot.action("choose_plan", async (ctx: Context) => {
    ctx.replyWithSticker(
      "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
    );
    await ctx.reply("Please choose a plan:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Basic Plan", callback_data: "basic_plan" },
            { text: "Advanced Plan", callback_data: "advanced_plan" },
            { text: "Free Plan", callback_data: "free_plan" },
          ],
        ],
      },
    });
  });

  bot.action("free_option", async (ctx: Context) => {
    if (ctx.callbackQuery) {
      await handlePlanSelection(ctx, "Free");
    }
  });

  bot.action(["basic_plan", "advanced_plan"], async (ctx: Context | any) => {
    if (ctx.callbackQuery) {
      const plan = ctx.callbackQuery.data;
      await handlePlanSelection(ctx, plan);
    }
  });
}

async function handlePlanSelection(ctx: Context, plan: string) {
  await ctx.replyWithSticker(
    "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
  );

  const user = await prisma.user.findUnique({
    where: { idTelegram: ctx.from?.id.toString() },
    include: { plan: true },
  });

  if (user && user.plan.name !== plan) {
    await prisma.user.update({
      where: { idTelegram: ctx.from?.id.toString() },
      data: {
        plan: {
          update: { name: plan },
        },
      },
    });

    await ctx.reply(
      `Thank you for choosing the ${plan} plan. Activating your plan...`
    );
    await sleep(15000); // Wait 15 seconds
    await ctx.reply(`Your ${plan} plan is now active!`);
  } else {
    await ctx.reply(`You are already on the ${plan} plan.`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Agora podemos lançar o bot em outro lugar do código ou em um arquivo separado
bot.launch();

// Start the server
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});