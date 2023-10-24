import { type BotState } from 'botbuilder-core';
import {
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import MyComponentDialog from './my-dialogs';

export const AGENT_AS_DIALOG = 'AGENT_AS_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class AgentAsDialog extends MyComponentDialog {
  constructor (userState: BotState) {
    super(AGENT_AS_DIALOG);

    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.queryLLM.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async queryLLM (stepContext: WaterfallStepContext) {
    // console.log('[DEBUG] queryLLM.')
    return await stepContext.endDialog('large language model tokens');
  }
}
