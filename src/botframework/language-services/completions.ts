import { createAxiosClient } from '../http-client';
import loadEnv from '../load-env';
import { type HistoryQueueType } from '../bots/dialogue-manager';

const composeCompletionPrompt = (input: string, history: HistoryQueueType['events']) => {
  const turns = [];
  for (const record of Object.values(history)) {
    if (record.role === 'assistant') {
      turns.push(`  [assistant]: ${record.text}`);
    } else {
      turns.push(`  [user]: ${record.text}`);
    }
  }
  const chatHistory = turns.join('\n');

  const text = `<s>[INST] <<SYS>>
Work as an experienced, professional CUSTOMER SUPPORT staff for \
online grocery store. We have conversation with user who visists our website, \
and has various questions related to exibited products. Together, you and I will \
support visitors to retrieve information of any product available on our website. \
Visitor will query product information such as availability, description, \
brand, price, product name. Comply with the act guideline, which is the system of ACT CODES:
  [ACT001] compose message to wellcome user
  [ACT004] compose message to say goodbye to user
  [ACT020] compose message to show gratitude to user
  [ACT031] request api to search for product details
  [ACT090] compose message to inform that user's inquire is out of scope
PLEASE suggest ACTION CODE in Plan/Action section. PLEASE thoughtfully compose \
message to reply LAST TURN in discussion history. Please write your answer in a \
short, BRIEF, and STRUCTURED FORM. Especially DO NOT add and make up any extra \
text before or after. To help with data extraction, your report must be in below template:
  # Keywords/Keyphrases: /* critical information from last user's message */
  # Product/NER: /* to recognize product name, or product category, or brand name from last user's message */
  # Intent/Scope: /* out scope if the last user's message is irrelevant to cosmetics, \
food, houseware, personal care; in scope if user is to start new conversation  */
  # Analysing/Reasoning: /* consider information from discussion, Keywords/Keyphrases, Intent/Scope, \
ACT CODES reason about how to make decision, predict what is the impact of our action */
  # Plan/Action: /* infer best ACT CODE based on Reasoning/Predicting; take ACT090 when out scope case */
  # Message/Response: /* compose polite, authentic, concise reply last LAST MESSAGE \
based on Analysing/Reasoning, Plan/Actions, Intent/Scope */
USER DISCUSSION HISTORY:
${chatHistory}<</SYS>>

  me: Please give me your report[/INST]`

  return text;
}

const completions = async (input: string, history: HistoryQueueType['events']) => {
  const prompt = composeCompletionPrompt(input, history);
  console.debug('[DEBUG] completions -> prompt: ', prompt);

  const {
    LS_COMPLETION_ENDPOINT_URL: url,
    LS_COMPLETION_ENDPOINT_PORT: port,
    LS_COMPLETION_ENDPOINT_SCHEME: scheme
  } = loadEnv();
  const path = 'v1/completions'
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

const parseSection = (re: RegExp, text: string) => {
  const matched = re.exec(text);

  return matched === null ? '' : matched[1]
}

const parseCompletionResult = (text: string) => {
  const result = {
    'Keywords/Keyphrases': parseSection(/^#\sKeywords\/Keyphrases:\s(.+)$/gm, text),
    'Product/NER': parseSection(/^#\sProduct\/NER:\s(.+)$/mg, text),
    'Intent/Scope': parseSection(/^#\sIntent\/Scope:\s(.+)$/mg, text),
    'Analysing/Reasoning': parseSection(/^#\sAnalysing\/Reasoning:\s(.+)$/mg, text),
    'Plan/Action': parseSection(/^#\sPlan\/Action:\s(.+)$/mg, text),
    'Message/Response': ''
  };

  let messageResponse = parseSection(/^#\sMessage\/Response:\s"(.+)"$/mg, text);
  if (messageResponse === null) {
    messageResponse = arseSection(/^#\sMessage\/Response:\s(.+)$/mg, text);
  }
  result['Message/Response'] = messageResponse;

  return result;
}

export default completions;
export { parseCompletionResult };
