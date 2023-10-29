import { MongoClient } from 'mongodb';
import loadEnv from '../load-env';

const connectDb = async () => {
  const { MONGODB_CONNECTION, MONGODB_DATABASE } = loadEnv();
  const mongoClient = new MongoClient(
    `${MONGODB_CONNECTION}/${MONGODB_DATABASE}`, { maxPoolSize: 100 });
  await mongoClient.connect();

  return mongoClient;
}

const createMongoClientWrapper = () => {
  let mongoClient: MongoClient;

  return async function () {
    if (mongoClient === undefined) {
      mongoClient = await connectDb();
    }

    return mongoClient;
  }
}

const createMongoClient = createMongoClientWrapper();

export const getBotbuilderDb = async () => {
  const { MONGODB_DATABASE } = loadEnv();
  const mongoClient = await createMongoClient();

  return mongoClient.db(MONGODB_DATABASE);
}

export default createMongoClient;
