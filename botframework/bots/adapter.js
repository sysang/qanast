const path = require('path');
const { CloudAdapter, ConfigurationBotFrameworkAuthentication } = require('botbuilder');

// Read environment variables from .env file
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const createAdapter = async () => {

  const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env);

  // Create adapter.
  // See https://aka.ms/about-bot-adapter to learn more about how bots work.
  const adapter = new CloudAdapter(botFrameworkAuthentication);

  // Catch-all for errors.
  adapter.onTurnError = async (context, error) => {
      // This check writes out errors to console log .vs. app insights.
      // NOTE: In production environment, you should consider logging this to Azure
      //       application insights. See https://aka.ms/bottelemetry for telemetry
      //       configuration instructions.
      console.error(`\n [onTurnError] unhandled error: ${ error }`);

      // Send a trace activity, which will be displayed in Bot Framework Emulator
      await context.sendTraceActivity(
          'OnTurnError Trace',
          `${ error }`,
          'https://www.botframework.com/schemas/error',
          'TurnError'
      );

      // Send a message to the user
      await context.sendActivity('The bot encountered an error or bug.');
      await context.sendActivity('To continue to run this bot, please fix the bot source code.');
      // Clear out state
      // await conversationState.clear(context);
  };

  return adapter;
}

module.exports = createAdapter;
