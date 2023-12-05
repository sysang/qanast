import {
  ComponentDialog,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import { type ConversationTurn } from '../bots/dialogue-manager';
import * as LanguageService from '../language-services';
import { type DialogContextOptions } from './types';

export const AGENT_AS_DIALOG = 'AGENT_AS_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class AgentAsDialog<O extends DialogContextOptions> extends ComponentDialog {
  constructor () {
    super(AGENT_AS_DIALOG);

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new WaterfallDialog<O>(WATERFALL_DIALOG, [
      this.queryLLM.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async queryLLM (stepContext: WaterfallStepContext<O>) {
    const userMessage = stepContext.context.activity.text
    // TODO: verify if result has valid struture
    const result = await LanguageService.completions(userMessage, stepContext.options.history) as ConversationTurn;
    return await stepContext.endDialog(result.content);
  }
}
