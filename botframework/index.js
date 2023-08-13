// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const createAdapter = require('./bots/adapter.js');
const createBot = require('./bots/bot.js');
const createStorage = require( './bots/storage.js');
const { createTranscriptLoggerMiddleware } = require( './bots/middlewares.js');
const createServer = require('./server.js');

const main = async () => {
  const storage = await createStorage();
  const bot = await createBot(storage);
  const adapter = await createAdapter();

  const middlewares = [
    await createTranscriptLoggerMiddleware(),
  ];
  for (let middleware of middlewares) {
    adapter.use(middleware);
  }

  await createServer(bot, adapter);
}

main();
