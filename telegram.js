require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const chatId = process.env.TELEGRAM_CHAT_ID;
const botToken = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(botToken, { polling: false });

const sendChat = async (message) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log("📤 Telegram message sent:", message);
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error);
  }
};

module.exports = sendChat;
