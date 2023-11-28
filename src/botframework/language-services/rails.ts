import { type HistoryQueueType } from '../bots/dialogue-manager';

const completions = async (input: string, history: HistoryQueueType['events']) => {
  const {
    RAILS_COMPLETION_ENDPOINT_URL: url,
    RAILS_COMPLETION_ENDPOINT_PORT: port,
    RAILS_COMPLETION_ENDPOINT_SCHEME: scheme
  } = loadEnv();
  const path = 'v1/chat/completions'
  const baseURL = `${scheme}://${url}:${port}`;
  const client = createAxiosClient(baseURL);

  const data = {
    prompt,
    stop: ['</s>'],
    max_tokens: 1000,
    temperature: 0.1,
    top_p: 0.95,
    top_k: 19
  }

  const response = await client.post(path, data)
  const result = response.data?.choices?.[0]?.text;
  console.debug('[DEBUG] completions -> result:', result);

  return parseCompletionResult(result);
}
