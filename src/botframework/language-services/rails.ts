import { v4 as uuidv4 } from 'uuid';

import { type ConversationTurn, type HistoryQueueType } from '../bots/dialogue-manager';
import { getClient } from '../rpc/rabbitmq';

export const sendToLlama2Chat = async (data: Array<ConversationTurn>) => {
  const client = await getClient();
  const queueName = 'llama2_chat';

  return await new Promise((resolve, reject) => {
    client.createChannel(function (error1, channel) {
      if (error1 instanceof Error) {
        reject(error1);
      }
      channel.assertQueue(queueName, {
        exclusive: false,
        durable: false
      }, function (error2, q) {
        if (error2 instanceof Error) {
          reject(error2);
        }
        const correlationId = uuidv4();

        console.log(` [x] Requesting ${queueName}`);

        channel.consume(q.queue, function (msg) {
          if (msg?.properties.correlationId === correlationId) {
            const content = msg.content.toString();
            console.log(' [.] Got %s', content);
            resolve(JSON.parse(content));
            setTimeout(function () {
              channel.close(() => {});
            }, 100);
          }
        }, {
          noAck: true
        });

        channel.sendToQueue(
          queueName,
          Buffer.from(JSON.stringify(data)),
          { contentType: 'application/json', correlationId, replyTo: q.queue }
        );

        setTimeout(function () {
          channel.close(() => {});
          reject(new Error('AMQ request timeout.'));
        }, 10 * 60 * 60 * 1000);
      });
    });
  })
}

const completions = async (input: string, history: HistoryQueueType['events']) => {
  const chatHistory = Object.values(history);

  const response = await sendToLlama2Chat(chatHistory);

  return response;
}

export default completions;
