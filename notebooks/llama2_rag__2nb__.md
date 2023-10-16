---
jupyter:
  jupytext:
    cell_metadata_filter: -all
    formats: md,ipynb
    main_language: python
    text_representation:
      extension: .md
      format_name: markdown
      format_version: '1.3'
      jupytext_version: 1.14.1
---

```python
from typing import Any, List, Mapping, Optional
import json

import requests

from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.llms.base import LLM
```

```python
class CustomLLM(LLM):
    max_tokens: int
    api_url: str

    @property
    def _llm_type(self) -> str:
        return "custom"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        if stop is not None:
            raise ValueError("stop kwargs are not permitted.")

        headers = { 'Content-Type' : 'application/json' }

        # prompt_tpl = f"<s>[INST] <<SYS>>\n You are a helpful, respectful and honest assistant. \
        # Your answer is always as concise as possible, while being informative, sufficient. \
        # Please ensure that your responses are truthful, inspiring, positive. Please do not \
        # response to question thas is inappropriate or contradictory. If you don't know the \
        # answer to a question, please don't share false information\n<</SYS>>\n\n {prompt} [/INST]"

        context = """OpenAI CEO Sam Altman has announced internally that the company is targeting $1.3 billion in annual revenue, according to The Information.
That's 30 percent more than the $1 billion in annual revenue leaked over the summer, which was already said to have exceeded investor expectations. The new figure suggests more than $100 million in monthly revenue.
The biggest revenue driver is subscriptions to ChatGPT Plus. Last year, without the ChatGPT Plus offering, OpenAI had revenue of only $28 million, with a loss of $540 million, according to The Information.
Due to the increase in revenue and rapid growth in recent months, OpenAI is estimated to have a new valuation of up to $90 billion. The goal is for employees to be able to sell their shares to outside investors at that level."""

        question = "does annual revenue meet investor expectations? Yes or no?"

        prompt_tpl = f"<s>[INST] <<SYS>>\n You are a helpful, informative assistant. \
        Your answer is always as concise as possible. If you don't know the \
        answer to a question, please don't share false information\n<</SYS>>\n\nGive short answer for the \
        question based only on the following context:\n{context}\n\n Question: {question}[/INST]"

        data = {
            'prompt': prompt_tpl,
            "stop": ["</s>"],
            "max_tokens": self.max_tokens
        }
        r = requests.post(
            self.api_url,
            headers=headers,
            data=json.dumps(data),
            timeout=1200)

        response_data = r.json()

        return response_data['choices'][0]['text']

    @property
    def _identifying_params(self) -> Mapping[str, Any]:
        """Get the identifying parameters."""
        return {
            "max_tokens": self.max_tokens,
            "api_url": self.api_url
        }

llm = CustomLLM(max_tokens=500, api_url="http://192.168.58.9:3000/v1/completions")
```

```python
llm("Describe 10 funcdamental steps to build a ecoomerce website")
```
