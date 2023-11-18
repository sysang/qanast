import { createAxiosClient } from '../http-client';
import loadEnv from '../load-env';
import { type HistoryQueueType } from '../bots/dialogue-manager';

const composePrompt = (input: string, history: HistoryQueueType['events']) => {
  const conversation = [
    `[INST] <<SYS>>As a sale assistant, you are supporting our potential customer
    to explore effectively products of our e-commerce website. You are always concise,
    professional, kind and authentic when giving response to our customer. Our customer
    would regularly query about product information such as: availability, description,
    brand, price, product name, etc. Sometimes customer also asks about shop information
    such as: location, open time. In most of the cases a discussion with our customer will 
    have many turns, after each user turn, your mission to suggest appropriate action
    to your manager (me). Action would be one of: compose a message to ask user to 
    rephrase; compose message to ask user to clarify query; recognize product is being 
    interested; recognize when user wants to ask for product availability; recognize when
    user wants to ask for product price; recognize when user wants to ask for product 
    description; recognize when user wants to ask for product brand.<</SYS>>[/INST]`,
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

const composeCompletionPrompt = (input: string, history: HistoryQueueType['events']) => {
  const turns = [];
  for (const record of Object.values(history)) {
    if (record.role === 'bot') {
      turns.push(`[my message]: ${record.text}`);
    } else {
      turns.push(`[user message]: ${record.text}`);
    }
  }
  const chatHistory = turns.join('\n');

  const text = `<s>[INST] <<SYS>>
Act as experienced, clever sales assistant. Together, you and I are helping \
our users to explore effectively all products of online grocery store. It \
will be a great success if we finally can recommend the correct, relevant \
product that the user is searching for. Most users regularly have many \
inquiries about product information such as availability, description, brand, \
price, product name, etc. Sometimes user wants to ask about shop information \
such as address, and open time. Occationally user may ask something not related \
to product or goods, do not try to answer and should remind user about out e-commerce \
site. In most cases, a discussion (chat) with a user will have multiple turns. \
Your work is to consider information embedded in discussion \
history, formulate thinking by steps to infer the best appropriate action and report \
the result to me. Comply with the acting system below which has a list of acting codes:
  - Compose a greeting message (Act-001).
  - Compose goodbye message (Act-002).
  - Compose a message to thank the user (Act-003).
  - Compose a message to ask the discussing user to rephrase (Act-004).
  - Compose a message to ask the user to clarify the query (Act-005).
  - Remember the user's intention (Act-006).
  - Remember the product is being interested (Act-007).
  - Remember that user's intention to ask for product availability (Act-008).
  - Remember that user's intention to ask for the product price (Act-009).
  - Remember that user's intention to ask for a product description (Act-010).
  - Remember that user's intention to ask for the product brand (Act-011).
  - Perform a search for the product if the user's inquiry has been fully understood (Act-012).
  - Reject inappropriate user's message (Act-013).
  - Remind gently user about the e-commerce functionality of our website (Act-014).
Please make your answer in a short, brief, and structured form, especially do not add and make up any extra text before or after. To help with data extraction, your report must be in below format:
# Observation/Analysis: (derive more detailed, hidden, meaningful information)
# Keywords/Keyphrases: (critical information that affects plan, action, message)
# In/Out Scope: (verify if user's message is in relavant scope)
# Reasoning/Plan: (combine, consider your responsibility, acting system, observation and analysis result to conflate thoughts finally.)
# Prediction/Action: (justify impact of various actions, specify action codes based on previous steps)
# Message/Text: (to reply to user politely, authentically)
</SYS>>

Discustion history:
  ${chatHistory}
Your task: Suggest to me appropriate acting code.
Your report:[/INST]`

  return text;
}

export default async function (input: string, history: HistoryQueueType['events']) {
  const prompt = composeCompletionPrompt(input, history);
  console.debug("[DEBUG] completions -> prompt:", prompt);

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

  const response = await client.post(path, data)
  const result = response.data?.choices?.[0]?.text;
  console.debug("[DEBUG] completions -> result:", result);

  return result;
}
