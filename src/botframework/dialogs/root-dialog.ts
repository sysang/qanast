import {
  ComponentDialog,
  type DialogTurnResult,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import type DialogueManager from '../bots/dialogue-manager';

const ROOT_DIALOG = 'ROOT_DIALOG';
const MAIN_LOOP = 'MAIN_LOOP';
const TEXT_PROMPT = 'TEXT_PROMPT';

class RootDialog extends ComponentDialog {
  readonly dialogs: DialogueManager;

  constructor (dialogueManager: DialogueManager) {
    super(ROOT_DIALOG);

    this.dialogs = dialogueManager;

    this.addDialog(new TextPrompt(TEXT_PROMPT));

    this.addDialog(new WaterfallDialog(MAIN_LOOP, [
      this.startingStep.bind(this),
      this.sayThenListenStep.bind(this),
      this.loopingStep.bind(this)
    ]));

    this.initialDialogId = MAIN_LOOP;
  }

  async startingStep (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    // @ts-expect-error
    const actingDialog = stepContext.dialogs.getActingDialog();
    return await stepContext.beginDialog(actingDialog.id);
  }

  async sayThenListenStep (stepContext: WaterfallStepContext) {
    const promptOptions = { prompt: stepContext.result };

    // Ask the user to enter their name.
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  async loopingStep (stepContext: WaterfallStepContext) {
    return await stepContext.replaceDialog(MAIN_LOOP);
  }
}

export default RootDialog;
