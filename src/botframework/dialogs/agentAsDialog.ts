import {
  ComponentDialog,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

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
    const response = await LanguageService.completions(
      stepContext.context.activity.text, stepContext.options.history);
    const result = response.data?.choices?.[0]?.text;
    return await stepContext.endDialog(result);
  }
}
