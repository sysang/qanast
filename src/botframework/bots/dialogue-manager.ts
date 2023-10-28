import { ActivityTypes } from 'botframework-schema';
import {
  type BotState,
  type SendActivitiesHandler,
  type StatePropertyAccessor,
  type TurnContext
} from 'botbuilder-core';
import { type ComponentDialog, DialogSet } from 'botbuilder-dialogs';

import type RootDialog from '../dialogs/root-dialog';

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

const CHAT_HISTORY_PROPERTY = 'CHAT_HISTORY_PROPERTY';

class DialogueManager extends DialogSet {
  private _actingDialogId!: string;
  private _history: HistoryQueueType['events'] = {};
  readonly historyAccessor: StatePropertyAccessor<HistoryQueueType>;

  constructor (
    conversationState: BotState,
    userState: BotState,
    dialogs: ComponentDialog[]) {
    super();

    if (dialogs.length === 0) {
      throw new Error('DialogueManager requires not empty list of dialogs');
    }

    for (const dialog of dialogs) {
      this.add(dialog);
    }

    this.decideActingDialog();

    this.historyAccessor = conversationState.createProperty<HistoryQueueType>(CHAT_HISTORY_PROPERTY);
  }

  public setActingDialog (id: string) {
    this._actingDialogId = id;
  }

  public getActingDialog () {
    return this.find(this._actingDialogId);
  }

  public decideActingDialog () {
    this.setActingDialog(this.getDialogs()[0].id);
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
      await this.historyAccessor.set(turnContext,
        { events: _events, backIndex, frontIndex, historyLength });
    } else {
      await this.historyAccessor.set(turnContext,
        { events, backIndex, frontIndex, historyLength });
    }

    console.log('events: ', events);

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

  public async enqueueBotEvent (turnContext: TurnContext, text: string) {
    const events = await this.enqueueEvent(
      turnContext,
      {
        role: 'bot',
        text
      }
    );
    this.setHistory(events);
  }

  public async getChatHistoryState (turnContext: TurnContext) {
    const history = await this.historyAccessor.get(turnContext, this.initializeHistory());
    return history;
  }

  public setHistory (history: HistoryQueueType['events']) {
    this._history = history;
  }

  public getHistory () {
    return this._history;
  }

  public bindEnqueueEventOnSendActivities (turnContext: TurnContext): SendActivitiesHandler {
    return async (context, activities, next) => {
      for (const activity of activities) {
        if (activity.type !== ActivityTypes.Message || activity.text === undefined) {
          continue;
        }

        await this.enqueueBotEvent(turnContext, activity.text);
      }

      return await next();
    }
  }
}

export default DialogueManager;
