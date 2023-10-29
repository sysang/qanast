import { type Activity } from 'botframework-schema';
import { TranscriptLoggerMiddleware } from 'botbuilder-core';
import { type Logger } from 'pino';

import { createTranscriptLogger } from '../logging/pino';

class CustomTranscriptLogger {
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
    this.logger.info(activity);
  }
}

export const createTranscriptLoggerMiddleware = async () => {
  const _logger = await createTranscriptLogger();
  const logger = new CustomTranscriptLogger(_logger);
  return new TranscriptLoggerMiddleware(logger);
}
