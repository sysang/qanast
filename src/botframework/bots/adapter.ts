import path from 'path';
import { BotFrameworkAdapter } from 'botbuilder';
import { type TurnContext } from 'botbuilder-core';
import { type Activity, ActivityTypes, type ResourceResponse } from 'botframework-schema';

import { config } from 'dotenv';
import * as LanguageService from '../language-services';

// Read environment variables from .env file
const ENV_FILE = path.join(__dirname, '.env');
config({ path: ENV_FILE });

const createAdapter = async (): Promise<CustomBotFrameworkAdapter> => {
  // const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication();

  // Create adapter.
  // See https://aka.ms/about-bot-adapter to learn more about how bots work.
  // const adapter = new CloudAdapter(botFrameworkAuthentication);
  const adapter = new CustomBotFrameworkAdapter();

  // Catch-all for errors.
  adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry
    //       configuration instructions.
    console.error('\n [onTurnError] unhandled error, message: ', error);
    console.error('\n [onTurnError] unhandled error, stack: ', error.stack);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
      'OnTurnError Trace',
      `${error.message}`,
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

export class CustomBotFrameworkAdapter extends BotFrameworkAdapter {
  /**
  * Asynchronously sends a set of outgoing activities to a channel server.
  *
  * This method supports the framework and is not intended to be called directly for your code.
  * Use the turn context's [sendActivity](xref:botbuilder-core.TurnContext.sendActivity) or
  * [sendActivities](xref:botbuilder-core.TurnContext.sendActivities) method from your bot code.
  *
  * @param context The context object for the turn.
  * @param activities The activities to send.
  *
  * @returns An array of [ResourceResponse](xref:)
  *
  * @remarks
  * The activities will be sent one after another in the order in which they're received. A
  * response object will be returned for each sent activity. For `message` activities this will
  * contain the ID of the delivered message.
  */
  async sendActivities (context: TurnContext, activities: Array<Partial<Activity>>): Promise<ResourceResponse[]> {
    for (const activity of activities) {
      if (activity.type === ActivityTypes.Message && activity.text !== undefined) {
        const userMessage = activity.text;
        activity.text = await LanguageService.translation(userMessage, 'en', 'vi');
      }
    }
    return await super.sendActivities(context, activities);
  }
}

export default createAdapter;
