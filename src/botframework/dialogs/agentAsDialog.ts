import {
  ComponentDialog,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import * as LanguageService from '../language-services';

export const AGENT_AS_DIALOG = 'AGENT_AS_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class AgentAsDialog extends ComponentDialog {
  constructor () {
    super(AGENT_AS_DIALOG);

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.message.bind(this),
      this.queryLLM.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async message (stepContext: WaterfallStepContext) {
    const options = { prompt: 'Please enter your query.' }
    return await stepContext.beginDialog(TEXT_PROMPT, options);
  }

  async queryLLM (stepContext: WaterfallStepContext) {
    // console.log('[DEBUG] queryLLM.')
    const response = await LanguageService.completions('test');
    const result = response.data?.choices?.[0]?.text;
    return await stepContext.endDialog(result);
  }
}
