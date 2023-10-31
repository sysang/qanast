import { createAxiosClient } from '../http-client';
import loadEnv from '../load-env';
import { type HistoryQueueType } from '../bots/dialogue-manager';

const composePrompt = (input: string, history: HistoryQueueType['events']) => {
  const conversation = [
    '[INST] <<SYS>>You are a helpful chatbot <</SYS>>[/INST]',
  ]
  const _history = Object.values(history);
  for (const record of _history) {
    if (record.role === 'bot') {
      conversation.push(record.text);
    } else {
      conversation.push(`[INST] ${record.text} [/INST]`);
    }
  }
  conversation.push(`[INST] ${input} [/INST]`);

  return conversation.join('\n');
}

export default async function (input: string, history: HistoryQueueType['events']) {
  const prompt = composePrompt(input, history);

  const { 
    LS_COMPLETION_ENDPOINT_URL: url,
    LS_COMPLETION_ENDPOINT_PORT: port,
    LS_COMPLETION_ENDPOINT_SCHEME: scheme,
  } = loadEnv();
  const path = 'v1/completions'
  const baseURL = `${scheme}://${url}:${port}`;
  const client = createAxiosClient(baseURL);

  const data = {
    'prompt': prompt,
    "stop": ["</s>"],
    "max_tokens": 500
  }

  return client.post(path, data)
}
