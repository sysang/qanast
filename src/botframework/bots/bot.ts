import { ActivityHandler } from 'botbuilder';
import {
  type BotState,
  type BotHandler,
  ConversationState,
  type StatePropertyAccessor,
  type Storage,
  type TurnContext,
  UserState
} from 'botbuilder-core';
import { DialogSet, DialogTurnStatus } from 'botbuilder-dialogs';

import DialogueManager from './dialogue-manager';
import RootDialog from '../dialogs/root-dialog';
import { AgentAsDialog } from '../dialogs/agentAsDialog';

const DIALOG_STATE_PROPERTY = 'DIALOG_STATE_PROPERTY';

const createBot = (storage: Storage): DialogBot => {
  // Create user and conversation state with in-memory storage provider.
  const conversationState = new ConversationState(storage);
  const userState = new UserState(storage);

  // Create the main dialog.
  const dialogs = [new AgentAsDialog()];
  const dialogueManager = new DialogueManager( conversationState, userState, dialogs);

  const rootDialog = new RootDialog(dialogueManager);

  const dialogBot = new DialogBot(
    conversationState,
    userState,
    rootDialog,
    dialogueManager
  );

  return dialogBot;
}

export class DialogBot extends ActivityHandler {
  readonly conversationState: BotState;
  readonly userState: BotState;
  readonly rootDialog: RootDialog;
  readonly dialogStateAccessor: StatePropertyAccessor;

  /**
    *
    * @param {BotState} conversationState
    * @param {BotState} userState
    * @param {DialogueManager} dialogueManager
  */
  constructor (
    conversationState: BotState,
    userState: BotState,
    rootDialog: RootDialog,
    dialogueManager: DialogueManager,
  ) {
    super();
    this.conversationState = conversationState;
    this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
    this.userState = userState;

    this.rootDialog = rootDialog;

    this.onMembersAdded(this.createOnMemberAddedHandler());

    this.onMessage(this.createOnMessageHandler(dialogueManager));
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

  private createOnMessageHandler (dialogueManager: DialogueManager): BotHandler {
    return async (turnContext: TurnContext, next: () => Promise<void>): Promise<any> => {
      console.log('Running dialog with Message Activity.');

      // Run the Dialog with the new message Activity.
      // await dialog.run(context, dialogStateAccessor);

      const dialogSet = new DialogSet(this.dialogStateAccessor);
      dialogSet.add(this.rootDialog);
      const dialogContext = await dialogSet.createContext(turnContext);

      await dialogueManager.enqueueUserEvent(turnContext);

      dialogContext.context.onSendActivities(dialogueManager.bindEnqueueEventOnSendActivities(turnContext));

      const results = await dialogContext.continueDialog();
      if (results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.rootDialog.id);
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    }
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
