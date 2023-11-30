import amqp from 'amqplib/callback_api';
import { v4 as uuidv4 } from 'uuid';


const connect = async () => {
  const {
    RABBITMQ_SERVER_ENDPOINT_URL: url,
  } = loadEnv();

  return Promise((resolve, reject) => {
    amqp.connect(RABBITMQ_SERVER_ENDPOINT_URL, function(error0, connection) {
      if (error) {
        reject(error);
      }
      resolve(connection);
    }
  });
}

const createClient = aysnc () => {
  let client;

  const getClient = async () => {
    if (client === undefined) {
      client = connect();
    }
    return client;
  }

  return { getClient };
}

export const { getClient } = createClient();

amqp.connect('amqp://rabbituser:111@192.168.58.9:5672/', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertQueue('llama2_chat', {
      exclusive: false,
      durable: false
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      var correlationId = uuidv4();
      var num = 'hi';

      console.log(' [x] Requesting llama2_chat: %s', num);

      channel.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == correlationId) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(function() {
            connection.close();
            process.exit(0)
          }, 500);
        }
      }, {
        noAck: true
      });

      channel.sendToQueue('llama2_chat',
        Buffer.from(num.toString()),{
          correlationId: correlationId,
          replyTo: q.queue });
    });
  });
});
