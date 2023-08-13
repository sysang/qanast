const { 
  TranscriptLoggerMiddleware,
  ConsoleTranscriptLogger,
  TranscriptLogger,
} = require('botbuilder-core');
const { MongoClient } = require('mongodb');
const winston = require('winston');
const { format } = require('winston');
require('winston-mongodb');

class WinstonTranscriptLogger{
    constructor(logger){
      this.logger = logger; 
    }
    /**
     * Log an activity to the transcript.
     *
     * @param activity Activity being logged.
     */
    logActivity(activity) {
        if (!activity) {
            throw new Error('Activity is required.');
        }

        // tslint:disable-next-line:no-console
        this.logger.info(activity.id, { activity: activity });
    }
}

module.exports.createTranscriptLoggerMiddleware = async () => {
  const uri = 'mongodb://botframework:111@192.168.58.9:27017/botbuilder';
  const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
  await mongoClient.connect();

  const transportOptions = {
    db: await Promise.resolve(mongoClient),
    collection: 'transcript',
    metaKey: 'activity',
  };
  
  const _format = format((info, opts) => {
    return info;
  });
  const winsontLogger = winston.createLogger({
    level: 'info',
    format: _format(),
  });
  winsontLogger.add(new winston.transports.MongoDB(transportOptions));
  const logger = new WinstonTranscriptLogger(winsontLogger);

  return new TranscriptLoggerMiddleware(logger);
}

