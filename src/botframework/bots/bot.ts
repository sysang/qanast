import { ActivityHandler } from 'botbuilder';
import {
  UserState,
  ConversationState,
  type BotState,
  type BotHandler,
  type StatePropertyAccessor,
  type TurnContext,
  type Storage
} from 'botbuilder-core';

import RootDialog from '../dialogs/root-dialog';

export const DIALOG_STATE_PROPERTY = 'DIALOG_STATE_PROPERTY';

const createBot = (storage: Storage): MainBot => {
  // Create user and conversation state with in-memory storage provider.
  const conversationState = new ConversationState(storage);
  const userState = new UserState(storage);

  // Create the main dialog.
  const dialog = new RootDialog(userState);
  const mainBot = new MainBot(conversationState, userState, dialog);

  return mainBot;
}

export class DialogBot extends ActivityHandler {
  readonly conversationState: BotState;
  readonly userState: BotState;

  /**
    *
    * @param {BotState} conversationState
    * @param {BotState} userState
    * @param {RootDialog} dialog
  */
  constructor (conversationState: BotState, userState: BotState, dialog: RootDialog) {
    super();
    this.conversationState = conversationState;
    this.userState = userState;

    const dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

    this.onMessage(this.createOnMessageHandler(dialog, dialogState));
  }

  /**
    * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
    */
  public async run (context: TurnContext) {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }

  private createOnMessageHandler (dialog: RootDialog, dialogState: StatePropertyAccessor): BotHandler {
    return async (context: TurnContext, next: () => Promise<void>): Promise<any> => {
      console.log('Running dialog with Message Activity.');

      // Run the Dialog with the new message Activity.
      await dialog.run(context, dialogState);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    }
  }
}

export class MainBot extends DialogBot {
  constructor (conversationState: BotState, userState: BotState, dialog: RootDialog) {
    super(conversationState, userState, dialog);

    this.onMembersAdded(this.createOnMemberAddedHandler());
  }

  private createOnMemberAddedHandler (): BotHandler {
    return async (context: TurnContext, next: () => Promise<void>): Promise<any> => {
      const membersAdded = context.activity.membersAdded;
      if (Array.isArray(membersAdded)) {
        for (let cnt = 0; cnt < membersAdded.length; cnt++) {
          if (membersAdded[cnt].id !== context.activity.recipient.id) {
            const reply = `Welcome to Complex Dialog Bot ${membersAdded[cnt].name}. 
              This bot provides a complex conversation, with multiple dialogs. Type 
              anything to get started.`;
            await context.sendActivity(reply);
          }
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    }
  }
}

export default createBot;
