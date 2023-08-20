import {
  type BotState,
  type StatePropertyAccessor,
  type TurnContext
} from 'botbuilder-core';
import {
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import { TopLevelDialog, TOP_LEVEL_DIALOG } from './topLevelDialog';
import MyComponentDialog from './my-dialogs';

import { ROOT_DIALOG, WATERFALL_DIALOG } from '../constants';

class RootDialog extends MyComponentDialog {
  constructor (userState: BotState) {
    super(ROOT_DIALOG);

    this.initializeUserProfile(userState);

    this.addDialog(new TopLevelDialog(userState));
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.initialStep.bind(this),
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

  async initialStep (stepContext: WaterfallStepContext) {
    return await stepContext.beginDialog(TOP_LEVEL_DIALOG);
  }

  async finalStep (stepContext: WaterfallStepContext) {
    const userProfile = await this.userProfile.get(stepContext.context);

    const status = 'You are signed up to review ' +
        (userProfile.companiesToReview.length === 0 ? 'no companies' : userProfile.companiesToReview.join(' and ')) + '.';
    await stepContext.context.sendActivity(status);
    return await stepContext.endDialog();
  }
}

export default RootDialog;
