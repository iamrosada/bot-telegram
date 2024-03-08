// http/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaCustomersRepository } from "../database/prisma/repositories/prisma-customers-repository";
import { PrismaProductsRepository } from "../database/prisma/repositories/prisma-products-repository";
import { PurchaseProduct } from "../../application/usecases/purchase-product";
import { RabbitMQMessagingAdapter } from "../messaging/rabbitmq/adapters/rabbitmq-messaging-adapter";
import { prisma } from "../database/prisma/prisma";
import { Telegraf, Scenes, Context, Middleware } from "telegraf";

import { PrismaPurchasesRepository } from "../database/prisma/repositories/prisma-purchases-repository";
import { RabbitMQServer } from "../messaging/rabbitmq/rabbitmqserver";

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
  //handlePurchaseCourse(ctx);

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function listProductsForPlan(ctx: Context, plan: string) {
  try {
    // Instanciando o repositório de produtos
    const prismaProductsRepository = new PrismaProductsRepository();

    // Obtendo a lista de produtos
    let products = await prismaProductsRepository.list();

    // Se o plano for "Free", incluir apenas o primeiro produto na lista
    if (plan.toLowerCase() === "free" && products.length > 0) {
      products = [products[0]];
    }

    // Formatando a lista de produtos para exibição
    const productListText = products
      .map((product) => `${product.title}`)
      .join("\n");

    // Enviando a lista de produtos ao usuário
    await ctx.reply(`Products for ${plan} plan:\n${productListText}`);
  } catch (error) {
    console.error("Error listing products:", error);
    // Tratar erros adequadamente
    await ctx.reply("An error occurred while listing products.");
  }
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

    // Listar produtos para o plano selecionado
    await listProductsForPlan(ctx, plan);

    // Adicionar botão de comprar curso para planos Advanced Plan e Basic Plan
    await sleep(15000); // Wait 15 seconds

    if (
      plan.toLowerCase() === "advanced_plan" ||
      plan.toLowerCase() === "basic_plan"
    ) {
      await ctx.reply(
        "Would you like to purchase a course? Please provide your email.",
        {
          reply_markup: {
            force_reply: true, // Força o usuário a responder diretamente a esta mensagem
          },
        }
      );
    }
  } else {
    await ctx.reply(`You are already on the ${plan} plan.`);
  }

  // Criar uma nova ação para capturar a resposta do usuário com o e-mail
  bot.on("message", async (ctx: Context | any) => {
    const prismaCustomersRepository = new PrismaCustomersRepository();
    const prismaProductsRepository = new PrismaProductsRepository();
    const prismaPurchasesRepository = new PrismaPurchasesRepository();
    const products = await prismaProductsRepository.list();
    const rabbitMQMessagingAdapter = new RabbitMQMessagingAdapter(
      process.env.RABBITMQ_URL || "amqp://localhost"
    ); // Adicionado

    const purchaseProductUseCase = new PurchaseProduct(
      prismaCustomersRepository,
      prismaProductsRepository,
      prismaPurchasesRepository,
      rabbitMQMessagingAdapter // Adicionado
    );
    const userResponse = ctx.message?.text;
    // Verificar se a mensagem recebida é um e-mail válido
    const isValidEmail = validateEmail(userResponse);
    if (isValidEmail) {
      let userName = ctx.from?.username || "";
      let fullName = `${ctx.from?.first_name || ""} ${
        ctx.from?.last_name || ""
      }`;

      // Construir o objeto de mensagem com o e-mail e o nome do usuário
      const message = {
        email: userResponse,
        username: userName,
        fullname: fullName,
        products: products.map((product) => product.title), // Adiciona os títulos dos produtos
      };
      const rabbitMQServer2 = new RabbitMQServer("amqp://localhost");

      // Publicando uma mensagem na fila para enviar um e-mail de confirmação para o usuário
      await rabbitMQServer2
        .start()
        .then(async () => {
          // Publicando uma mensagem na primeira fila
          const emailQueueName = "send.email";
          await rabbitMQServer2.publish(emailQueueName, message);
          console.log("Message published successfully to email queue.");
        })
        .catch((error) => {
          console.error("Error starting RabbitMQ server 1:", error);
        });

      // Lógica de compra do curso para cada produto

      for (const product of products) {
        await purchaseProductUseCase.execute({
          name: fullName,
          email: userResponse,
          productId: product.id,
        });

        console.log(
          `Purchase executed successfully for product ID: ${product.id}`
        );
      }

      await ctx.reply(
        `Thank you! Your email (${userResponse}) and name (${fullName}) have been received.`
      );
    } else {
      await ctx.reply(
        "Please provide a valid email address., for that go to choose and select again"
      );
    }
  });
}

// Função para validar um endereço de e-mail simplesmente
function validateEmail(email: string): boolean {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

bot.launch();

// Start the server
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
