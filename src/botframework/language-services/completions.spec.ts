import { describe, expect, test } from '@jest/globals';

import { parseCompletionResult } from './completions';

describe('completions', () => {
  test('parseCompletionResult', () => {
    const text = `# Keywords/Keyphrases: Cookies
# Product/NER: Cookies
# Scope/Case: In scope (cosmetics)
# Analysing/Reasoning: Based on the user's inquiry, it seems that they are looking for \
information about cookies available at our online grocery store. We can use ACT021 to \
ask for more details about the product being interested.
# Plan/Action: ACT021: Ask user for more details about the product being interested \
(e.g. brand name, flavor, etc.).
# Message/Response: "Hello! Yes, we do sell cookies at our online grocery store. Can \
you please tell me more about the specific type of cookie you are looking for? (Brand \
name, flavor, etc.)"`
    const expected = [
      'Cookies',
      'Cookies',
      'In scope (cosmetics)',
      `Based on the user's inquiry, it seems that they are looking for \
information about cookies available at our online grocery store. We can use ACT021 to \
ask for more details about the product being interested.`,
      `ACT021: Ask user for more details about the product being interested \
(e.g. brand name, flavor, etc.).`,
      `Hello! Yes, we do sell cookies at our online grocery store. Can \
you please tell me more about the specific type of cookie you are looking for? (Brand \
name, flavor, etc.)`
    ]
    const actual = parseCompletionResult(text);

    expect(actual['Keywords/Keyphrases']).toBe(expected[0]);
    expect(actual['Product/NER']).toBe(expected[1]);
    expect(actual['Scope/Case']).toBe(expected[2]);
    expect(actual['Analysing/Reasoning']).toBe(expected[3]);
    expect(actual['Plan/Action']).toBe(expected[4]);
    expect(actual['Message/Response']).toBe(expected[5]);
  });
});
