import { createAxiosClient } from '../http-client';
import loadEnv from '../load-env';

const composePrompt = (text: string) => {
  const prompt = `[INST] <<SYS>>You are a helpful chatbot <</SYS>>
Human: hi im bob
AI:   Hello there, Bob! *adjusts glasses* It's nice to meet you. Is there something on your mind that you'd like to talk about or ask? I'm here to help with any questions or problems you might have.
Human: please tell me my name
AI:   Of course, Bob! *smiling* Your name is... Bob! 😊 Is there anything else you'd like to chat about or ask? I'm here to help with any questions or problems you might have.
Human: [INST] what is large language model? [/INST]`;
  return prompt;
}

export default async function (text: string) {
  const { 
    LS_COMPLETION_ENDPOINT_URL: url,
    LS_COMPLETION_ENDPOINT_PORT: port,
    LS_COMPLETION_ENDPOINT_SCHEME: scheme,
  } = loadEnv();
  const path = 'v1/completions'
  const baseURL = `${scheme}://${url}:${port}`;
  const client = createAxiosClient(baseURL);

  const prompt = composePrompt('test');
  const data = {
    'prompt': prompt,
    "stop": ["</s>"],
    "max_tokens": 500
  }

  return client.post(path, data)
}
