const TelegramBot = require("node-telegram-bot-api");

// Replace 'YOUR_TOKEN' with your actual Telegram bot token
const token = "7147070611:AAGA3RzbN44mFiRyTQ7cBR0jpU-4hW390IY";
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg: any) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Hello! Welcome to the bot.");

  bot.once("message", (msg: any) => {
    if (msg.text.toLowerCase() === "hello") {
      sendActions(chatId);
    }
  });
});

function sendActions(chatId: any) {
  const options = {
    reply_markup: JSON.stringify({
      keyboard: [[{ text: "Choose Task" }], [{ text: "Free Option" }]],
    }),
  };

  bot.sendMessage(chatId, "Select an action:", options);
}

bot.on("message", (msg: any) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  switch (text) {
    case "Choose Task":
      sendRates(chatId);
      break;
    case "Free Option":
      activateFreePlan(chatId);
      break;
  }
});

function sendRates(chatId: string) {
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Basic Plan", callback_data: "basic" }],
        [{ text: "Advanced Plan", callback_data: "advanced" }],
        [{ text: "Free Plan", callback_data: "free" }],
      ],
    }),
  };

  bot.sendMessage(chatId, "Choose a plan:", options);
}

bot.on("callback_query", (query: any) => {
  const chatId = query.message.chat.id;
  const plan = query.data;

  bot.answerCallbackQuery(query.id, `You chose the ${plan} plan.`);
  bot.sendMessage(
    chatId,
    "Thank you for choosing the plan. Sending a message for activation..."
  );

  setTimeout(() => {
    bot.sendMessage(chatId, "The plan has been activated.");
  }, 15000);
});

function activateFreePlan(chatId: string) {
  bot.sendMessage(chatId, "Activating the free plan...");

  setTimeout(() => {
    bot.sendMessage(chatId, "The free plan is now active.");
  }, 15000);
}
