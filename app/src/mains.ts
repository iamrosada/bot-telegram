// import { Telegraf, Context } from "telegraf";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const bot = new Telegraf("YOUR_TELEGRAM_BOT_TOKEN");

// // Middleware to send a hello message to the user
// bot.use(async (ctx: Context, next) => {
//   await ctx.replyWithSticker("STICKER_FILE_ID");
//   await ctx.reply('Hello! Please send "hello" to start.');

//   const user = await prisma.user.findUnique({
//     where: { idTelegram: ctx.from?.id.toString() },
//   });

//   if (!user) {
//     await prisma.user.create({
//       data: {
//         idTelegram: ctx.from?.id.toString(),
//         userName: ctx.from?.username || "",
//         fullName: `${ctx.from?.first_name || ""} ${ctx.from?.last_name || ""}`,
//         plan: {
//           create: {
//             name: "Free", // Defina o plano padrão para os novos usuários aqui
//           },
//         },
//       },
//     });
//   }

//   await next();
// });

// // Handling the user's response
// bot.hears("hello", async (ctx: Context) => {
//   await ctx.replyWithSticker("STICKER_FILE_ID");
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
//   await ctx.replyWithSticker("STICKER_FILE_ID");
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
//     await ctx.replyWithSticker("STICKER_FILE_ID");

//     const user = await prisma.user.findUnique({
//       where: { idTelegram: ctx.from?.id.toString() },
//       include: { plan: true },
//     });

//     if (user && user.plan.name !== "Free") {
//       await prisma.user.update({
//         where: { idTelegram: ctx.from?.id.toString() },
//         data: {
//           plan: {
//             update: { name: "Free" },
//           },
//         },
//       });

//       await ctx.reply(
//         "Thank you for choosing the free option. Activating your plan..."
//       );
//       await sleep(15000); // Wait 15 seconds
//       await ctx.reply("Your free plan is now active!");
//     } else {
//       await ctx.reply("You are already on the Free plan.");
//     }
//   }
// });

// bot.action(["basic_plan", "advanced_plan"], async (ctx: Context | any) => {
//   if (ctx.callbackQuery) {
//     await ctx.replyWithSticker("STICKER_FILE_ID");

//     const plan = ctx.callbackQuery.data;
//     const user = await prisma.user.findUnique({
//       where: { idTelegram: ctx.from?.id.toString() },
//       include: { plan: true },
//     });

//     if (user && user.plan.name !== plan) {
//       await prisma.user.update({
//         where: { idTelegram: ctx.from?.id.toString() },
//         data: {
//           plan: {
//             update: { name: plan },
//           },
//         },
//       });

//       await ctx.reply(
//         `Thank you for choosing the ${plan} plan. Activating your plan...`
//       );
//       await sleep(15000); // Wait 15 seconds
//       await ctx.reply(`Your ${plan} plan is now active!`);
//     } else {
//       await ctx.reply(`You are already on the ${plan} plan.`);
//     }
//   }
// });

// // Helper function to sleep
// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// bot.launch();
