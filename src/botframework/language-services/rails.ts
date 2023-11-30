import { type HistoryQueueType } from '../bots/dialogue-manager';

import { getClient } from '../rabbitmq-client';

const sendToLlama2Chat = async(data) => {
  const client = await getClient();
  const queueName = 'llama2_chat';

  return Promise((resolve, reject) => {
    client.createChannel(function(error1, channel) {
      if (error1) {
        reject(error1);
      }
      channel.assertQueue(queueName, {
        exclusive: false,
        durable: false
      }, function(error2, q) {
        if (error2) {
          reject(error2);
        }
        const correlationId = uuidv4();

        console.log(` [x] Requesting ${queueName}`);

        channel.consume(q.queue, function(msg) {
          if (msg.properties.correlationId == correlationId) {
            console.log(' [.] Got %s', msg.content.toString());
            setTimeout(function() {
              channel.close();
            }, 100);
          }
        }, {
          noAck: true
        });

        channel.sendToQueue(
          queueName,
          Buffer.from(data.toString()),
          {
            correlationId: correlationId,
            replyTo: q.queue 
          });

          setTimeout(function() {
            channel.close();
            reject(new Error('AMQ request timeout.'));
          }, 10000);
      });
    });
  })
}

const completions = async (input: string, history: HistoryQueueType['events']) => {

  const turns = [];
  for (const record of Object.values(history)) {
    if (record.role === 'assistant') {
      turns.push(`  [assistant]: ${record.text}`);
    } else {
      turns.push(`  [user]: ${record.text}`);
    }
  }
  const chatHistory = turns.join('\n');

  const response = await sendToLlama2Chat(chatHistory)

  return response;
}
