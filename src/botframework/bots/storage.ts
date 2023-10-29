import { MongoClient } from 'mongodb';
import { MongoDbStorage } from 'botbuilder-storage-mongodb';

import loadEnv from '../load-env';
import createMongoClient from '../db/mongo-client';

const createStorage = async () => {
  const { MONGODB_DATABASE } = loadEnv();
  const collectionName = 'botstate';
  const mongoClient = await createMongoClient();
  const collection = MongoDbStorage.getCollection(mongoClient, MONGODB_DATABASE, collectionName);

  return new MongoDbStorage(collection);
}

export default createStorage;
