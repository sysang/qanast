import {
  type DialogContext,
  type DialogTurnResult,
  ComponentDialog
} from 'botbuilder-dialogs';

import MemorisationDialog from './memorisation-dialog';

const _MyComponentDialog = MemorisationDialog<typeof ComponentDialog<object>>(ComponentDialog);

class MyComponentDialog extends _MyComponentDialog {
  public async continueDialog (dialogContext: DialogContext): Promise<DialogTurnResult> {
    console.log('continueDialog -> ', dialogContext.context.activity.text);
    this.enqueueEvent(
      dialogContext,
      {
        role: 'user',
        text: dialogContext.context.activity.text
      }
    );
    return await super.continueDialog(dialogContext);
  }
}

export default MyComponentDialog;
