const { ConversationState, UserState, } = require('botbuilder');

const { DialogAndWelcomeBot } = require('./dialogAndWelcomeBot');
const { MainDialog } = require('../dialogs/mainDialog');

const createBot = async (storage) => {

  // Define state store for your bot.
  // See https://aka.ms/about-bot-state to learn more about bot state.
  // const memoryStorage = new MemoryStorage();

  // Create user and conversation state with in-memory storage provider.
  const userState = new UserState(storage);
  const conversationState = new ConversationState(storage);

  // Create the main dialog.
  const dialog = new MainDialog(userState);
  const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);

  return bot
}

module.exports = createBot;
