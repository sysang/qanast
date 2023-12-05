import amqp, { type Connection } from 'amqplib/callback_api';
import { v4 as uuidv4 } from 'uuid';

import loadEnv from './load-env';

const {
  RABBITMQ_SERVER_ENDPOINT_URL: url
} = loadEnv();

amqp.connect(url, function (error, connection) {
  if (error instanceof Error) {
    throw error;
  }
  connection.createChannel(function (error1, channel) {
    if (error1 instanceof Error) {
      throw error1;
    }

    channel.assertQueue('llama2_chat', {
      exclusive: false,
      durable: false
    }, function (error2, q) {
      if (error2 instanceof Error) {
        throw error2;
      }
      const correlationId = uuidv4();
      const message = { 'user': 'hello world' };

      console.log(' [x] Requesting llama2_chat: %s', message);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg?.properties?.correlationId === correlationId) {
            console.log(' [.] Got %s', msg.content.toString());
            setTimeout(function () {
              connection.close();
              process.exit(0)
            }, 500);
          }
        },
        { noAck: true }
      );

      channel.sendToQueue(
        'llama2_chat',
        Buffer.from(JSON.stringify(message).toString()),
        { contentType: 'application/json', correlationId: correlationId, replyTo: q.queue }
      );
    });
  });
});
