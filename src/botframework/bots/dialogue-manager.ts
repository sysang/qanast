import { type Dialog } from 'botbuilder-dialogs';

class DialogueManager {
  private readonly dialogs: Record<string, Dialog> = {};
  private actingDialogId!: string;

  constructor (dialogs: Dialog[]) {
    if (dialogs.length === 0) {
      throw new Error('DialogueManager requires not empty list of dialogs');
    }
    for (const dialog of dialogs) {
      this.dialogs[dialog.id] = dialog;
    }

    this.decideActingDialog();
  }

  public getDialogs () {
    return Array.from(Object.values(this.dialogs));
  }

  public setActingDialog (id: string) {
    this.actingDialogId = id;
  }

  public getActingDialog () {
    return this.dialogs[this.actingDialogId];
  }

  public decideActingDialog () {
    this.setActingDialog(Object.values(this.dialogs)[0].id);
  }
}

export default DialogueManager;
