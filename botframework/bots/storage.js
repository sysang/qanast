const { MongoClient } = require('mongodb');
const { MongoDbStorage } = require('botbuilder-storage-mongodb');

const createStorage = async () => {
  const uri = 'mongodb://botframework:111@192.168.58.9:27017/botbuilder';
  const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
  await mongoClient.connect();
  const collection = MongoDbStorage.getCollection(mongoClient, 'botbuilder', 'botframework');
  const mongoStorage = new MongoDbStorage(collection);

  return mongoStorage;
}

module.exports = createStorage;
