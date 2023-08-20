import { type BotState } from 'botbuilder-core';
import {
  NumberPrompt,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import MyComponentDialog from './my-dialogs';
import { ReviewSelectionDialog, REVIEW_SELECTION_DIALOG } from './reviewSelectionDialog';

export const TOP_LEVEL_DIALOG = 'TOP_LEVEL_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

export class TopLevelDialog extends MyComponentDialog {
  constructor (userState: BotState) {
    super(TOP_LEVEL_DIALOG);

    this.initializeUserProfile(userState);

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));

    this.addDialog(new ReviewSelectionDialog(userState));

    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.nameStep.bind(this),
      this.ageStep.bind(this),
      this.startSelectionStep.bind(this),
      this.acknowledgementStep.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async nameStep (stepContext: WaterfallStepContext) {
    // Create an object in which to collect the user's information within the dialog.

    const promptOptions = { prompt: 'Please enter your name.' };

    // Ask the user to enter their name.
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  async ageStep (stepContext: WaterfallStepContext) {
    // Set the user's name to what they entered in response to the name prompt.
    await this.userProfile.update(stepContext.context, { name: stepContext.result });

    const promptOptions = { prompt: 'Please enter your age.' };

    // Ask the user to enter their age.
    return await stepContext.prompt(NUMBER_PROMPT, promptOptions);
  }

  async startSelectionStep (stepContext: WaterfallStepContext) {
    // Set the user's age to what they entered in response to the age prompt.
    const age = stepContext.result;
    await this.userProfile.update(stepContext.context, { age });

    if (age < 25) {
      // If they are too young, skip the review selection dialog, and pass an empty list to the next step.
      await stepContext.context.sendActivity('You must be 25 or older to participate.');

      return await stepContext.next();
    } else {
      // Otherwise, start the review selection dialog.
      return await stepContext.beginDialog(REVIEW_SELECTION_DIALOG);
    }
  }

  async acknowledgementStep (stepContext: WaterfallStepContext) {
    // Set the user's company selection to what they entered in the review-selection dialog.
    const userProfile = await this.userProfile.get(stepContext.context);

    await stepContext.context.sendActivity(`Thanks for participating ${userProfile.name}`);

    // Exit the dialog, returning the collected user information.
    return await stepContext.endDialog();
  }
}
