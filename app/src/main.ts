import { Telegraf, Context } from "telegraf";

const bot = new Telegraf("7147070611:AAGA3RzbN44mFiRyTQ7cBR0jpU-4hW390IY");

// Middleware to send a hello message to the user
bot.use((ctx: Context, next) => {
  ctx.replyWithSticker(
    "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
  ); // Adicione o ID do arquivo do sticker aqui
  ctx.reply('Hello! Please send "hello" to start.');
  next();
});

// Handling the user's response
bot.hears("hello", async (ctx: Context) => {
  ctx.replyWithSticker(
    "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
  ); // Adicione o ID do arquivo do sticker aqui
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

// Handling button clicks
bot.action("choose_plan", async (ctx: Context) => {
  ctx.replyWithSticker(
    "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
  ); // Adicione o ID do arquivo do sticker aqui
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
    ctx.replyWithSticker(
      "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
    ); // Adicione o ID do arquivo do sticker aqui
    await ctx.reply(
      "Thank you for choosing the free option. Activating your plan..."
    );
    await sleep(15000); // Wait 15 seconds
    await ctx.reply("Your free plan is now active!");
  }
});

bot.action(["basic_plan", "advanced_plan"], async (ctx: Context | any) => {
  if (ctx.callbackQuery) {
    ctx.replyWithSticker(
      "CAACAgIAAxkBAUKlF2XoPUIP_WasegbILrEf8yUlOBpWAAIZAAPp2BMoV2ES2mxgqss0BA"
    ); // Adicione o ID do arquivo do sticker aqui
    const plan = ctx.callbackQuery.data;
    await ctx.reply(
      `Thank you for choosing the ${plan} plan. Activating your plan...`
    );
    await sleep(15000); // Wait 15 seconds
    await ctx.reply(`Your ${plan} plan is now active!`);
  }
});

// Helper function to sleep
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

bot.launch();

// Middleware to send a hello message to the user
// bot.use((ctx: Context, next) => {
//   ctx.reply('Hello! Please send "hello" to start.');
//   next();
// });

// // Handling the user's response
// bot.hears("hello", async (ctx: Context) => {
//   await ctx.reply("Great! Choose an option:", {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           { text: "Choose Plan", callback_data: "choose_plan" },
//           { text: "Free Option", callback_data: "free_option" },
//         ],
//       ],
//     },
//   });
// });

// // Handling button clicks
// bot.action("choose_plan", async (ctx: Context) => {
//   await ctx.reply("Please choose a plan:", {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           { text: "Basic Plan", callback_data: "basic_plan" },
//           { text: "Advanced Plan", callback_data: "advanced_plan" },
//           { text: "Free Plan", callback_data: "free_plan" },
//         ],
//       ],
//     },
//   });
// });

// bot.action("free_option", async (ctx: Context) => {
//   if (ctx.callbackQuery) {
//     await ctx.reply(
//       "Thank you for choosing the free option. Activating your plan..."
//     );
//     await sleep(15000); // Wait 15 seconds
//     await ctx.reply("Your free plan is now active!");
//   }
// });

// bot.action(["basic_plan", "advanced_plan"], async (ctx: Context | any) => {
//   if (ctx.callbackQuery) {
//     const plan = ctx.callbackQuery.data;
//     await ctx.reply(
//       `Thank you for choosing the ${plan} plan. Activating your plan...`
//     );
//     await sleep(15000); // Wait 15 seconds
//     await ctx.reply(`Your ${plan} plan is now active!`);
//   }
// });

// // Helper function to sleep
// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// bot.launch();

// import * as amqp from "amqplib";

// async function main() {
//   const connection = await amqp.connect("amqp://localhost");
//   const channel = await connection.createChannel();

//   const queue = "hello";
//   const msg = "Hello World!";

//   channel.assertQueue(queue, { durable: false });
//   channel.sendToQueue(queue, Buffer.from(msg));

//   console.log(`[x] Sent ${msg}`);

//   setTimeout(() => {
//     connection.close();
//     process.exit(0);
//   }, 500);
// }

// main().catch(console.error);
