import {describe, expect, test} from '@jest/globals';

import { type BotState } from 'botbuilder-core';
import {
  WaterfallDialog,
  type WaterfallStepContext
} from 'botbuilder-dialogs';

import { DialogTestClient } from 'botbuilder-testing';
import { MemoryStorage, UserState, ConversationState } from 'botbuilder';

import DialogueManager from '../bots/dialogue-manager';
import MyComponentDialog from './my-dialogs';
import RootDialog from './root-dialog';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const SIMPLE_DIALOG_ID = 'SIMPLE_DIALOG_ID'
const SIMPLE_DIALOG_STEP_RESULT = 'test tokens';

export class SimpleDialog extends MyComponentDialog {
  constructor (userState: BotState) {
    super(SIMPLE_DIALOG_ID);

    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.stepOne.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async stepOne (stepContext: WaterfallStepContext) {
    return await stepContext.endDialog(SIMPLE_DIALOG_STEP_RESULT);
  }
}

function initilizeClient () {
  const storage = new MemoryStorage();
  const userState = new UserState(storage);
  const conversationState = new ConversationState(storage);
  const simpleDialog = new SimpleDialog(userState);
  const dialogueManager = new DialogueManager([ simpleDialog ]);
  const rootDialog = new RootDialog(conversationState, userState, dialogueManager);
  const client =  new DialogTestClient('test', rootDialog);

  return { client, dialogueManager, rootDialog, simpleDialog }
}

describe('RootDialog', () => {
  // test('Reply result returned from child dialog', async () => {
  //   const { client, dialogueManager, rootDialog, simpleDialog } = initilizeClient(); 
  //   const reply = await client.sendActivity('hello');
  //   expect(reply.text).toBe(SIMPLE_DIALOG_STEP_RESULT);
  // });

  test('Correct history after responsing to first user\'s message', async () => {
    const { client, dialogueManager, rootDialog, simpleDialog } = initilizeClient(); 
    await client.sendActivity('hello');
    await client.sendActivity('goodbye');
    const history = await rootDialog.getHistory();
    console.log(history);
    expect(Object.keys(history).length).toBe(4);
  });
});
