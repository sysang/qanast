import { type Dialog } from 'botbuilder-dialogs';

class DialogueManager {
  private readonly dialogs: Record<string, Dialog> = {};

  constructor (dialogs: Dialog[]) {
    for (const dialog of dialogs) {
      this.dialogs[dialog.id] = dialog;
    }
  }

  public getDialogs () {
    return Array.from(Object.values(this.dialogs));
  }

  public decideActingDialog () {
    const actingDialogId = 'AGENT_AS_DIALOG';
    return actingDialogId;
  }
}

export default DialogueManager;
