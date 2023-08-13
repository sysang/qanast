const restify = require('restify');

const createServer = async (bot, adapter) => {

  // Create HTTP server
  const server = restify.createServer();
  server.use(restify.plugins.bodyParser());

  // Listen for incoming requests.
  server.post('/api/messages', async (req, res) => {
      // Route received a request to adapter for processing
      await adapter.process(req, res, (context) => bot.run(context));
  });

  server.listen(process.env.port || process.env.PORT || 3978, function() {
      console.log(`\n${ server.name } listening to ${ server.url }`);
      console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
      console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
  });

}

module.exports = createServer;
