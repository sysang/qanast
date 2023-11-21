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
      turns.push(`[me]: ${record.text}`);
    } else {
      turns.push(`[user]: ${record.text}`);
    }
  }
  const chatHistory = turns.join('\n');

  const text = `<s>[INST] <<SYS>>
JOB DESCRIPTION: Work as an experienced, professional CUSTOMER SUPPORT staff for \
online grocery store. Users come to our website will ask various questions about \
our products exibited on our website. Together, you and I will help visitors to \
explore effectively all products available on our website. It will be a great success \
if we finally can recommend the correct, relevant product that \
user is searching for. Most users regularly have many inquiries about product \
information such as availability, description, brand, price, product name, etc. \
Sometimes user wants to ask about shop information such as address, and open time. \
Occationally user may ask something not related to the products, DO NOT try to \
answer, just answer questions that are relevant to our products such as \
COSMETICS, FOOD, HOUSEWARE, PERSONAL CARE. In most cases, a discussion \
(chat) with a user will have multiple turns. Your work is to analyse information \
formulate THINKING BY STEPS, suggest the best appropriate action. Comply with \
the act guideline, which is the system of ACT CODES:
  [ACT001] reply user's greeting
  [ACT004] reply user's goodbye
  [ACT020] ask user to clarify her/his ambiguous inquiry
  [ACT021] ask user more details about product being interested
  [ACT022] ask user to describe more about product being interested
  [ACT024] ask user for product brand details
  [ACT031] perform a search api because the user's inquiry has been fully understood
  [ACT090] reject inappropriate user's message when out scope case
  [ACT091] remind gently user that our website is online grocery store when out scope case
Please make your answer in a short, BRIEF, and STRUCTURED FORM. Especially DO NOT \
add and make up any extra text before or after. To help with data extraction, your \
report must be in below template:
  # Keywords/Keyphrases: (representative, relevant information)
  # Product/NER: (to recognize product name, or product category, or brand name)
  # Scope/Case: (out scope if the user's inquiry is irrelevant to cosmetics, \
food, houseware, personal care)
  # Analysing/Reasoning: (consider information from discussion, Keywords/Keyphrases, Scope/Case, \
ACT CODES reason about how to make decision, predict what is the impact of our action)
  # Plan/Action: (infer appropriate CODE based on Reasoning/Predicting, take ACT091 when out scope case)
  # Message/Response: (compose polite, authentic, concise reply based on Analysing/Reasoning, \
Plan/Actions, Scope/Case)
</SYS>>

Discustion history:
  ${chatHistory}
Report your suggestions to me, suggest ACTION CODE in Plan/Action section.[/INST]`

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
    "max_tokens": 1000,
    "temperature": 0.1,
    "top_p": 0.95,
    "top_k": 19
  }

  const response = await client.post(path, data)
  const result = response.data?.choices?.[0]?.text;
  console.debug("[DEBUG] completions -> result:", result);

  return result;
}
