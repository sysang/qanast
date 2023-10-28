import { describe, expect, test } from '@jest/globals';

import { MemoryStorage } from 'botbuilder';
import { TestAdapter } from 'botbuilder-core';
import {
  ComponentDialog,
  TextPrompt,
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import { DialogTestClient } from '../test-helpers/dialog-test-client';
import createBot from '../bots/bot';

const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const SIMPLE_DIALOG_ID = 'SIMPLE_DIALOG_ID'
const SIMPLE_DIALOG_STEP_MESSAGE = 'test message';
const SIMPLE_DIALOG_STEP_RESULT = 'test tokens';

export class SimpleDialog extends ComponentDialog {
  constructor () {
    super(SIMPLE_DIALOG_ID);

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.stepOne.bind(this),
      this.stepTwo.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async stepOne (stepContext: WaterfallStepContext) {
    return await stepContext.beginDialog(TEXT_PROMPT, { prompt: SIMPLE_DIALOG_STEP_MESSAGE });
  }

  async stepTwo (stepContext: WaterfallStepContext) {
    return await stepContext.endDialog(SIMPLE_DIALOG_STEP_RESULT);
  }
}

function initilizeClient () {
  const storage = new MemoryStorage();
  const dialogs = [new SimpleDialog()];
  const dialogBot = createBot(storage, dialogs);

  const adapter = new TestAdapter(async (context): Promise<void> => { await dialogBot.run(context) });

  const client = new DialogTestClient(adapter);

  return { client, adapter, dialogBot, dialogs }
}

describe('DialogBot + DialogueManager + RootDialog', () => {
  test('Should get reply as TextPrompt and should get reply as SimpleDialog result', async () => {
    const { client } = initilizeClient();
    let reply = await client.sendActivity('hello');
    expect(reply.text).toBe(SIMPLE_DIALOG_STEP_MESSAGE);
    reply = await client.sendActivity('test');
    expect(reply.text).toBe(SIMPLE_DIALOG_STEP_RESULT);
  });

  test('Should have correct event history', async () => {
    const { client, dialogBot } = initilizeClient();
    await client.sendActivity('hello');
    await client.sendActivity('test');
    await client.sendActivity('hi');
    const history = dialogBot.rootDialog.dialogs.getHistory();

    const actual = {
      '0': { role: 'user', text: 'hello' },
      '1': { role: 'bot', text: SIMPLE_DIALOG_STEP_MESSAGE},
      '2': { role: 'user', text: 'test' },
      '3': { role: 'bot', text: SIMPLE_DIALOG_STEP_RESULT },
      '4': { role: 'user', text: 'hi' },
      '5': { role: 'bot', text: SIMPLE_DIALOG_STEP_MESSAGE }
    }
    expect(Object.keys(history).length).toBe(6);
    expect(history).toStrictEqual(actual);
  });
});
