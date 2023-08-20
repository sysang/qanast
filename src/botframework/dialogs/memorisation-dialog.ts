import { type BotState } from 'botbuilder-core';
import { type DialogContext } from 'botbuilder-dialogs';
import { type Activity } from 'botframework-schema';

import { ROOT_DIALOG } from '../constants';
import { type UserProfile, type UserDataBinder, getUserProfile } from '../user-profile';

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

type Constructor = new (...args: any[]) => object;

// https://www.typescriptlang.org/docs/handbook/mixins.html
function MemorisationDialog<Tbase extends Constructor> (Base: Tbase) {
  return class Extended extends Base {
    readonly rootDialogId = ROOT_DIALOG;
    readonly chatHistoryStateProperty = 'this.CHAT_HISTORY_PROPERTY';
    public _userProfile?: UserDataBinder<UserProfile>;

    public initializeUserProfile (userState: BotState) {
      const initialData = {
        name: '',
        age: -1,
        companiesToReview: []
      }
      this._userProfile = getUserProfile(userState, initialData);
    }

    public get userProfile (): UserDataBinder<UserProfile> {
      if (this._userProfile === undefined) {
        throw new Error(`Inproper setup for class that is inherited from MemorisationDialog, 
          to fix it invoke this.initializeUserProfile in constructor`);
      }

      return this._userProfile;
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

      const rootContext = this.getRootDialogContext(dialogContext);

      if (backIndex > historyLength && events[frontIndex] !== undefined) {
        frontIndex++;
        for (let idx = frontIndex; idx < backIndex; idx++) {
          _events[idx] = events[idx];
        }
        rootContext.state.setValue(this.chatHistoryStateProperty,
          { _events, backIndex, frontIndex, historyLength });
      } else {
        rootContext.state.setValue(this.chatHistoryStateProperty,
          { events, backIndex, frontIndex, historyLength });
      }
    }

    public getRootDialogContext (dialogContext: DialogContext) {
      let rootContext = dialogContext;
      let parent = rootContext.parent

      while (parent !== undefined) {
        rootContext = parent;
        parent = parent.parent;
      }

      if (
        rootContext.activeDialog !== undefined &&
        rootContext.activeDialog.id !== this.rootDialogId
      ) {
        throw new Error(
          `Dialog hierachy is malformed, can not get predefined root dialog id. 
          Call getRootDialogContext() get: ${rootContext.activeDialog.id}`)
      }

      return rootContext;
    }

    public getChatHistoryState (dialogContext: DialogContext) {
      const rootContext = this.getRootDialogContext(dialogContext);
      const history = rootContext.state.getValue(this.chatHistoryStateProperty, this.initializeHistory());
      console.log('history: ', history);
      return history;
    }

    public getEvents (dialogContext: DialogContext) {
      const history = this.getChatHistoryState(dialogContext);
      return history.events;
    }

    public async sendActivity (dialogContext: DialogContext, activity: Activity) {
      // enqueueEvent();
      await dialogContext.context.sendActivity(activity);
    }
  }
}

export default MemorisationDialog;
