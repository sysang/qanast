import {
  ComponentDialog,
  type DialogTurnResult,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import type DialogueManager from '../bots/dialogue-manager';

const ROOT_DIALOG = 'ROOT_DIALOG';
const MAIN_LOOP = 'MAIN_LOOP';
const TEXT_PROMPT = 'TEXT_PROMPT';

class RootDialog extends ComponentDialog {
  // readonly chatHistoryStateProperty = 'CHAT_HISTORY_PROPERTY';
  // readonly _historyAccessor: StatePropertyAccessor<HistoryQueueType>;
  // readonly dialogueManager: DialogueManager;
  // private _history: HistoryQueueType['events'] = {};
  // readonly _conversationState: BotState;

  constructor (dialogueManager: DialogueManager) {
    super(ROOT_DIALOG);

    // this._conversationState = conversationState;

    // this._historyAccessor = conversationState.createProperty<HistoryQueueType>(this.chatHistoryStateProperty);

    // this.dialogueManager = dialogueManager;

    // for (const dialog of this.dialogueManager.getDialogs()) {
    //   this.addDialog(dialog);
    // }

    // this.initializeUserProfile(userState);
    // @ts-expect-error
    this.dialogs = dialogueManager;

    this.addDialog(new TextPrompt(TEXT_PROMPT));

    this.addDialog(new WaterfallDialog(MAIN_LOOP, [
      this.startingStep.bind(this),
      this.sayThenListenStep.bind(this),
      this.loopingStep.bind(this)
    ]));

    this.initialDialogId = MAIN_LOOP;
  }

  /**
    * The run method handles the incoming activity (in the form of a TurnContext) 
    *  and passes it through the dialog system.
    * If no dialog is active, it will start the default dialog.
    * @param {*} turnContext
    * @param {*} accessor
    */
  // async run (turnContext: TurnContext, dialogStateAccessor: StatePropertyAccessor) {
  //   const dialogSet = new DialogSet(dialogStateAccessor);
  //   dialogSet.add(this);
  //   const dialogContext = await dialogSet.createContext(turnContext);

  //   await this.enqueueUserEvent(turnContext);

  //   dialogContext.context.onSendActivities(this.bindEnqueueEventOnSendActivities(turnContext));

  //   const results = await dialogContext.continueDialog();
  //   if (results.status === DialogTurnStatus.empty) {
  //     await dialogContext.beginDialog(this.id);
  //   }
  // }

  async startingStep (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    // @ts-expect-error
    const actingDialog = stepContext.dialogs.getActingDialog();
    return await stepContext.beginDialog(actingDialog.id);
  }

  async sayThenListenStep (stepContext: WaterfallStepContext) {
    const promptOptions = { prompt: stepContext.result };

    // Ask the user to enter their name.
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  async loopingStep (stepContext: WaterfallStepContext) {
    return await stepContext.replaceDialog(MAIN_LOOP);
  }
}

export default RootDialog;
