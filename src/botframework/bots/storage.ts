import { MongoClient } from 'mongodb';
import { MongoDbStorage } from 'botbuilder-storage-mongodb';

const createStorage = async () => {
  const uri = 'mongodb://botframework:111@192.168.58.9:27017/botbuilder';
  const mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  const collection = MongoDbStorage.getCollection(mongoClient, 'botbuilder', 'botframework');
  return new MongoDbStorage(collection);
}

export default createStorage;
