import { type HistoryQueueType } from '../bots/dialogue-manager';

export type DialogContextOptions = {
  history: HistoryQueueType['events'];
}
