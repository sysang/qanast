import {describe, expect, test} from '@jest/globals';

import { MemoryStorage, UserState, } from 'botbuilder';
import { DialogTestClient } from 'botbuilder-testing';

import RootDialog from './root-dialog';

const storage = new MemoryStorage();
const userState = new UserState(storage);
const rootDialog = new RootDialog(userState);
const client = new DialogTestClient('test', rootDialog);

describe('RootDialog', () => {
  test('adds 1 + 2 to equal 3', async () => {
    let reply = await client.sendActivity('hello');
    let history = await rootDialog.getHistory();
    console.log('reply: ', reply);
    console.log('history: ', history);
    expect(1 + 2).toBe(3);
  });
});
