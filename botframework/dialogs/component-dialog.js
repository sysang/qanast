const { ComponentDialog } = require('botbuilder-dialogs');

const Queue = require('../queue');

const ROOT_DIALOG = 'ROOT_DIALOG';

class MyComponentDialog extends ComponentDialog {
  constructor(dialogId, userState, isRootDialog) {
    this.rootDialogId = ROOT_DIALOG;
    this.chatHistoryStateProperty = 'this.CHAT_HISTORY_PROPERTY';
    this.historyLength = 10;
  
    if (isRootDialog) {
      super(this.rootDialogId);
    } else {
      super(dialogId);
    }
  }

  initializeHistory() {
    return {
      event: {};
      frontIndex: 0;
      backIndex: 0;
    }
  }

  enqueueEvent(dialogContext, event) {
    let { events, backIndex, frontIndex } = getChatHistoryState(dialogContext);
    events[backIndex] = event;
    backIndex++

    if (backIndex > this.historyLength) {
      delete events[frontIndex]
      frontIndex++
    }

    const rootContext = this.getRootDialogContext(dialogContext);
    rootContext.state.setValue(this.chatHistoryStateProperty, { events, backIndex, frontIndex });
  }

  getRootDialogContext(dialogContext) {
    let rootContext = dialogContext.parent;
    
    while (rootContext.parent) {
      rootContext = rootContext.parent;
    }

    if (rootContext.activeDialog.id !== this.rootDialogId) {
      throw new Error(
        'Dialog hierachy is malformed, can not get predefined root dialog id. Call getRootDialogContext() get: ',
        rootContext.activeDialog.id)
    }
  
    return rootContext;
  }

  getChatHistoryState(dialogContext) {
    const rootContext = this.getRootDialogContext(dialogContext);
    const history = rootContext.state.getValue(this.chatHistoryStateProperty);
    if (!history || !history.events) {
      history = this.initialize();
      rootContext.state.setValue(this.chatHistoryStateProperty, history);
    }
    console.log('history: ', history);
    return history;
  }

  getEvents(dialogContext) {
    const history = this.getChatHistoryState(dialogContext);
    return history.events;
  }

  sendActivity(dialogContext, activity) {
    // enqueueEvent();
    dialogContext.sendActivity(activity);
  }
}

module.exports = MyComponentDialog;

