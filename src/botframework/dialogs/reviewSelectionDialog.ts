import { type BotState } from 'botbuilder-core';
import {
  ChoicePrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import MyComponentDialog from './my-dialogs';

export const REVIEW_SELECTION_DIALOG = 'REVIEW_SELECTION_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class ReviewSelectionDialog extends MyComponentDialog {
  readonly doneOption: string;
  readonly companiesSelected: string;
  readonly companyOptions: string[];

  constructor (userState: BotState) {
    super(REVIEW_SELECTION_DIALOG);

    this.initializeUserProfile(userState);

    // Define a "done" response for the company selection prompt.
    this.doneOption = 'done';

    // Define value names for values tracked inside the dialogs.
    this.companiesSelected = 'value-companiesSelected';

    // Define the company choices for the company selection prompt.
    this.companyOptions = ['Adatum Corporation', 'Contoso Suites', 'Graphic Design Institute', 'Wide World Importers'];

    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.selectionStep.bind(this),
      this.loopStep.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async selectionStep (stepContext: WaterfallStepContext) {
    const userProfile = await this.userProfile.get(stepContext.context);
    // Create a prompt message.
    let message = '';
    if (userProfile.companiesToReview.length === 0) {
      message = `Please choose a company to review, or \`${this.doneOption}\` to finish.`;
    } else {
      message = `You have selected **${userProfile.companiesToReview[0]}**. You can review 
      an additional company, or choose \`${this.doneOption}\` to finish.`;
    }

    // Create the list of options to choose from.
    const options = userProfile.companiesToReview.length > 0
      ? this.companyOptions.filter(function (item) { return item !== userProfile.companiesToReview[0]; })
      : this.companyOptions.slice();
    options.push(this.doneOption);

    // Prompt the user for a choice.
    return await stepContext.prompt(CHOICE_PROMPT, {
      prompt: message,
      retryPrompt: 'Please choose an option from the list.',
      choices: options
    });
  }

  async loopStep (stepContext: WaterfallStepContext) {
    // Retrieve their selection list, the choice they made, and whether they chose to finish.
    const userProfile = await this.userProfile.get(stepContext.context);
    const choice = stepContext.result;
    const done = choice.value === this.doneOption;

    if (!done) {
      // If they chose a company, add it to the list.
      userProfile.companiesToReview.push(choice.value);
      await this.userProfile.update(stepContext.context, userProfile);
    }

    if (done || userProfile.companiesToReview.length > 1) {
      // If they're done, exit and return their list.
      return await stepContext.endDialog();
    } else {
      // Otherwise, repeat this dialog, passing in the list from this iteration.
      return await stepContext.replaceDialog(REVIEW_SELECTION_DIALOG);
    }
  }
}
