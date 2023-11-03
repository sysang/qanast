import restify, {
  type Server,
  type Request,
  type Response
} from 'restify';
import { type TurnContext } from 'botbuilder-core';

import { type DialogBot } from './bots/bot';
import { type CustomBotFrameworkAdapter } from './bots/adapter';
import * as LanguageService from './language-services';

const createServer = async (bot: DialogBot, adapter: CustomBotFrameworkAdapter): Promise<Server> => {
  // Create HTTP server
  const server = restify.createServer();
  server.use(restify.plugins.bodyParser());

  // Listen for incoming requests.
  server.post(
    '/api/messages',
    async (req: Request, res: Response) => {
      if (req.body.type === 'message') {
        const userMessage = req.body.text;
        req.body.text = await LanguageService.translation(userMessage, 'vi', 'en');
      }

      await adapter.process(req, res, async (context: TurnContext) => {
        await bot.run(context);
      });
    }
  );

  return server;
}

export default createServer;
