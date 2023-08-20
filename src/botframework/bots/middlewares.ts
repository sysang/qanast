import { type Activity } from 'botframework-schema';
import { TranscriptLoggerMiddleware } from 'botbuilder-core';
import { MongoClient } from 'mongodb';
import winston, { format, type Logger } from 'winston';
require('winston-mongodb');

class WinstonTranscriptLogger {
  readonly logger: Logger;

  constructor (logger: Logger) {
    this.logger = logger;
  }

  /**
    * Log an activity to the transcript.
    *
    * @param activity Activity being logged.
    */
  public logActivity (activity: Activity) {
    this.logger.info(String(activity.id), { activity });
  }
}

export const createTranscriptLoggerMiddleware = async () => {
  const uri = 'mongodb://botframework:111@192.168.58.9:27017/botbuilder';
  const mongoClient = new MongoClient(uri);
  await mongoClient.connect();

  const transportOptions = {
    db: await Promise.resolve(mongoClient),
    collection: 'transcript',
    metaKey: 'activity'
  };

  const _format = format((info, opts) => {
    return info;
  });
  const winsontLogger = winston.createLogger({
    level: 'info',
    format: _format()
  });
  // @ts-expect-error
  winsontLogger.add(new winston.transports.MongoDB(transportOptions));
  const logger = new WinstonTranscriptLogger(winsontLogger);

  return new TranscriptLoggerMiddleware(logger);
}
