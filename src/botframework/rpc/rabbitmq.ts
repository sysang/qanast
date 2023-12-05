import amqp, { type Connection } from 'amqplib/callback_api';

import loadEnv from '../load-env';

const connect = async (): Promise<Connection> => {
  const {
    RABBITMQ_SERVER_ENDPOINT_URL: url
  } = loadEnv();

  return await new Promise((resolve, reject) => {
    amqp.connect(url, function (error, connection) {
      if (error instanceof Error) {
        reject(error);
      }
      resolve(connection);
    });
  });
}

const createClient = () => {
  let client: Connection;

  const getClient = async () => {
    if (client === undefined) {
      client = await connect();
    }
    return client;
  }

  return { getClient };
}

export const { getClient } = createClient();
