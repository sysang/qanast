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
  Dialog,
  DialogSet,
  DialogTurnStatus,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

// import { TopLevelDialog, TOP_LEVEL_DIALOG } from './topLevelDialog';
import { AgentAsDialog, AGENT_AS_DIALOG } from './agentAsDialog';
import MyComponentDialog from './my-dialogs';

const ROOT_DIALOG = 'ROOT_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
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
  readonly chatHistoryStateProperty = 'this.CHAT_HISTORY_PROPERTY';
  private _history: HistoryQueueType['events'] = {};

  constructor (userState: BotState) {
    super(ROOT_DIALOG);

    this.initializeUserProfile(userState);

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new AgentAsDialog(userState));
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.initialStep.bind(this),
      this.sayThenListenStep.bind(this),
      this.finalStep.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
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
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async initialStep (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    console.log('[DEBUG] initialStep.')
    return await stepContext.beginDialog(AGENT_AS_DIALOG);
  }

  async sayThenListenStep (stepContext: WaterfallStepContext) {
    console.log('[DEBUG] sayThenListenStep.')
    const promptOptions = { prompt: stepContext.result };

    // Ask the user to enter their name.
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  async finalStep (stepContext: WaterfallStepContext) {
    return await stepContext.replaceDialog(WATERFALL_DIALOG);
  }

  public initializeHistory (): HistoryQueueType {
    return {
      events: {},
      frontIndex: 0,
      backIndex: 0,
      historyLength: 20
    }
  }

  public enqueueEvent (dialogContext: DialogContext, event: HistoryEventType) {
    let { events, backIndex, frontIndex, historyLength } = this.getChatHistoryState(dialogContext);
    const _events: HistoryQueueType['events'] = {};
    events[backIndex] = event;
    backIndex++;

    if (backIndex > historyLength && events[frontIndex] !== undefined) {
      frontIndex++;
      for (let idx = frontIndex; idx < backIndex; idx++) {
        _events[idx] = events[idx];
      }
      dialogContext.state.setValue(this.chatHistoryStateProperty,
        { events: _events, backIndex, frontIndex, historyLength });
    } else {
      dialogContext.state.setValue(this.chatHistoryStateProperty,
        { events, backIndex, frontIndex, historyLength });
    }

    return events;
  }

  public getChatHistoryState (dialogContext: DialogContext) {
    const history = dialogContext.state.getValue(this.chatHistoryStateProperty, this.initializeHistory());
    return history;
  }

  public setHistory (history: HistoryQueueType['events']) {
    this._history = history;
  }

  public getHistory () {
    return this._history;
  }

  public async beginDialog (dialogContext: DialogContext): Promise<DialogTurnResult> {
    const events = this.enqueueEvent(
      dialogContext,
      {
        role: 'user',
        text: dialogContext.context.activity.text
      }
    );
    this.setHistory(events);

    return await super.beginDialog(dialogContext);
  }

  public async continueDialog (dialogContext: DialogContext): Promise<DialogTurnResult> {
    this.enqueueEvent(
      dialogContext,
      {
        role: 'user',
        text: dialogContext.context.activity.text
      }
    );

    dialogContext.context.onSendActivities(this.bindEnqueueEventOnSendActivities(dialogContext));

    return await super.continueDialog(dialogContext);
  }

  public bindEnqueueEventOnSendActivities (dialogContext: DialogContext): SendActivitiesHandler {
    return async (context, activities, next) => {
      for (const activity of activities) {
        if (activity.type !== ActivityTypes.Message || activity.text === undefined) {
          continue;
        }

        this.enqueueEvent(
          dialogContext,
          {
            role: 'bot',
            text: activity.text
          }
        );
      }

      return await next();
    }
  }
}

export default RootDialog;
