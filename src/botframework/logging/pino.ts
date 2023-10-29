import { Writable } from 'stream';

import pino from 'pino';
import build from 'pino-abstract-transport';

import { getBotbuilderDb } from '../db/mongo-client';

const createMongodbTransport = async (collectionName: string) => {
  const db = await getBotbuilderDb();
  const collection = db.collection(collectionName)

  const mongoStream = new Writable({
    objectMode: true,
    autoDestroy: true,
    write (chunk, enc, cb) {
      // todo: bulk insert?
      void collection.insertOne(chunk, { forceServerObjectId: true }).then(() => { cb() });
    }
  })

  const built = build(
    function (source) {
      source.pipe(mongoStream)
    },
    {
      close (err, cb) {
        mongoStream.end()
        mongoStream.once('close', cb.bind(null, err))
      }
    });

  return built;
}

export const createTranscriptLogger = async () => {
  const loggingCollection = 'transcript';
  const transport = await createMongodbTransport(loggingCollection);
  return pino(transport);
}

export const createRequestLogger = async () => {
  const loggingCollection = 'request';
  const transport = await createMongodbTransport(loggingCollection);
  return pino(transport);
}
