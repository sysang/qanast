// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import createAdapter from './bots/adapter';
import createBot from './bots/bot';
import createStorage from './bots/storage';
import { createTranscriptLoggerMiddleware } from './bots/middlewares';
import createServer from './server';

const startServer = async () => {
  const storage = await createStorage();
  const adapter = await createAdapter();

  const middlewares = [
    await createTranscriptLoggerMiddleware()
  ];
  for (const middleware of middlewares) {
    adapter.use(middleware);
  }

  const bot = createBot(storage);
  const server = await createServer(bot, adapter);

  server.listen(8887, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
  });

  return server;
}

startServer().catch((e) => {
  console.error(e);
});
