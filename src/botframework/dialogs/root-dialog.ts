import { ActivityTypes } from 'botframework-schema';
import {
  type BotState,
  type SendActivitiesHandler,
  type StatePropertyAccessor,
  type TurnContext
} from 'botbuilder-core';
import {
  type DialogContext,
  type DialogTurnResult,
  DialogSet,
  DialogTurnStatus,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import DialogueManager from '../bots/dialogue-manager';
// import { TopLevelDialog, TOP_LEVEL_DIALOG } from './topLevelDialog';
import MyComponentDialog from './my-dialogs';

const ROOT_DIALOG = 'ROOT_DIALOG';
const MAIN_LOOP = 'MAIN_LOOP';
const TEXT_PROMPT = 'TEXT_PROMPT';

type HistoryEventType = {
  role: 'bot' | 'user';
  text: string;
}

type HistoryQueueType = {
  events: Record<number, HistoryEventType>;
  frontIndex: number;
  backIndex: number;
  readonly historyLength: number;
}

class RootDialog extends MyComponentDialog {
  readonly chatHistoryStateProperty = 'CHAT_HISTORY_PROPERTY';
  readonly _historyAccessor: StatePropertyAccessor<HistoryQueueType>;
  readonly dialogueManager: DialogueManager;
  private _history: HistoryQueueType['events'] = {};
  readonly _conversationState: BotState;

  constructor (conversationState: BotState, userState: BotState, dialogueManager: DialogueManager) {
    super(ROOT_DIALOG);

    this._conversationState = conversationState;

    this._historyAccessor = conversationState.createProperty<HistoryQueueType>(this.chatHistoryStateProperty);

    this.dialogueManager = dialogueManager;

    for (const dialog of this.dialogueManager.getDialogs()) {
      this.addDialog(dialog);
    }

    this.initializeUserProfile(userState);

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
  async run (turnContext: TurnContext, accessor: StatePropertyAccessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(turnContext);

    await this.enqueueUserEvent(turnContext);
    dialogContext.context.onSendActivities(this.bindEnqueueEventOnSendActivities(turnContext));

    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async startingStep (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    this.dialogueManager.decideActingDialog();
    const actingDialog = this.dialogueManager.getActingDialog();

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

  public initializeHistory (): HistoryQueueType {
    return {
      events: {},
      frontIndex: 0,
      backIndex: 0,
      historyLength: 20
    }
  }

  public async enqueueEvent (turnContext: TurnContext, event: HistoryEventType) {
    let { events, backIndex, frontIndex, historyLength } = await this.getChatHistoryState(turnContext);
    const _events: HistoryQueueType['events'] = {};
    events[backIndex] = event;
    backIndex++;

    if (backIndex > historyLength && events[frontIndex] !== undefined) {
      frontIndex++;
      for (let idx = frontIndex; idx < backIndex; idx++) {
        _events[idx] = events[idx];
      }
      await this._historyAccessor.set(turnContext,
        { events: _events, backIndex, frontIndex, historyLength });
    } else {
      await this._historyAccessor.set(turnContext,
        { events: events, backIndex, frontIndex, historyLength });
    }

    await this._conversationState.saveChanges(turnContext, false);

    return events;
  }

  public async enqueueUserEvent (turnContext: TurnContext) {
    const events = await this.enqueueEvent(
      turnContext,
      {
        role: 'user',
        text: turnContext.activity.text
      }
    );
    this.setHistory(events);
  }

  public async getChatHistoryState (turnContext: TurnContext) {
    await this._conversationState.load(turnContext);
    const history = await this._historyAccessor.get(turnContext, this.initializeHistory());
    return history;
  }

  public setHistory (history: HistoryQueueType['events']) {
    this._history = history;
  }

  public getHistory () {
    return this._history;
  }

  // public async beginDialog (dialogContext: DialogContext): Promise<DialogTurnResult> {
  //   const events = this.enqueueEvent(
  //     dialogContext,
  //     {
  //       role: 'user',
  //       text: dialogContext.context.activity.text
  //     }
  //   );
  //   this.setHistory(events);

  //   return await super.beginDialog(dialogContext);
  // }

  // public async continueDialog (dialogContext: DialogContext): Promise<DialogTurnResult> {
  //   this.enqueueEvent(
  //     dialogContext,
  //     {
  //       role: 'user',
  //       text: dialogContext.context.activity.text
  //     }
  //   );

  //   dialogContext.context.onSendActivities(this.bindEnqueueEventOnSendActivities(dialogContext));

  //   return await super.continueDialog(dialogContext);
  // }

  public bindEnqueueEventOnSendActivities (turnContext: TurnContext): SendActivitiesHandler {
    return async (context, activities, next) => {
      for (const activity of activities) {
        if (activity.type !== ActivityTypes.Message || activity.text === undefined) {
          continue;
        }

        await this.enqueueUserEvent(turnContext);
      }

      return await next();
    }
  }
}

export default RootDialog;
