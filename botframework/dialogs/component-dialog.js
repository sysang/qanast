const { ComponentDialog } = require('botbuilder-dialogs');

const ROOT_DIALOG = 'ROOT_DIALOG';

class MyComponentDialog extends ComponentDialog {
  constructor(dialogId) {
    super(dialogId);

    this.rootDialogId = ROOT_DIALOG;
    this.chatHistoryStateProperty = 'this.CHAT_HISTORY_PROPERTY';
    this.historyLength = 20;
  }

  initializeHistory() {
    return {
      events: {},
      frontIndex: 0,
      backIndex: 0,
    }
  }

  enqueueEvent(dialogContext, event) {
    let { events, backIndex, frontIndex } = this.getChatHistoryState(dialogContext);
    events[backIndex] = event;
    backIndex++;

    if (backIndex > this.historyLength) {
      delete events[frontIndex]
      frontIndex++
    }

    const rootContext = this.getRootDialogContext(dialogContext);
    rootContext.state.setValue(this.chatHistoryStateProperty, { events, backIndex, frontIndex });
  }

  getRootDialogContext(dialogContext) {
    let rootContext = dialogContext;
    let parent = rootContext.parent
    
    while (parent) {
      rootContext = parent;
      parent = parent.parent;
    }

    if (rootContext.activeDialog && rootContext.activeDialog.id !== this.rootDialogId) {
      throw new Error(
        'Dialog hierachy is malformed, can not get predefined root dialog id. Call getRootDialogContext() get: ',
        rootContext.activeDialog.id)
    }
  
    return rootContext;
  }

  getChatHistoryState(dialogContext) {
    const rootContext = this.getRootDialogContext(dialogContext);
    const history = rootContext.state.getValue(this.chatHistoryStateProperty, this.initializeHistory());
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

  continueDialog (dialogContext) {
    console.log('continueDialog -> ', dialogContext.context.activity.text);
    this.enqueueEvent(dialogContext, { role: 'user', 'text': dialogContext.context.activity.text });
    return super.continueDialog(dialogContext);
  }
}

module.exports = MyComponentDialog;

