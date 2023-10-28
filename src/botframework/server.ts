import restify, {
  type Server,
  type Request,
  type Response
} from 'restify';
import { type CloudAdapter } from 'botbuilder';
import { type TurnContext } from 'botbuilder-core';

import { type DialogBot } from './bots/bot';

const createServer = async (bot: DialogBot, adapter: CloudAdapter): Promise<Server> => {
  // Create HTTP server
  const server = restify.createServer();
  server.use(restify.plugins.bodyParser());

  // Listen for incoming requests.
  server.post('/api/messages', async (req: Request, res: Response) => {
    // Route received a request to adapter for processing
    await adapter.process(req, res, async (context: TurnContext) => { await bot.run(context) });
  });

  return server;
}

export default createServer;
