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

from operator import itemgetter
from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.llms.base import LLM
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.schema.runnable import RunnablePassthrough, RunnableLambda
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

        print("[DEBUG] prompt: ", prompt)

        data = {
            'prompt': prompt,
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

model = CustomLLM(max_tokens=500, api_url="http://192.168.58.9:3000/v1/completions")
```

```python
prompt = ChatPromptTemplate.from_messages([
    ("system", "[INST] <<SYS>>You are a helpful chatbot <</SYS>>[/INST]"),
     MessagesPlaceholder(variable_name="memory"),
    ("human", "[INST] {input} [/INST]")
])
messages = prompt.format_messages(
    input="What is your name?",
    memory=[],
)
messages
```
```python
memory = ConversationBufferMemory(return_messages=True)
chain = RunnablePassthrough.assign(
    memory=RunnableLambda(memory.load_memory_variables) | itemgetter("history")
)
inputs = {"input": "hi im bob"}
chain.invoke(inputs)
```
```python
chain = RunnablePassthrough.assign(
    memory=RunnableLambda(memory.load_memory_variables) | itemgetter("history")
) | prompt | model
```

```python
inputs = {"input": "hi im bob"}
response = chain.invoke(inputs)
memory.save_context(inputs, {"output": response})
response
```

```python
inputs = {"input": "please tell me my name"}
response = chain.invoke(inputs)
memory.save_context(inputs, {"output": response})
response
```

```python
inputs = {"input": "what is large language model?"}
response = chain.invoke(inputs)
memory.save_context(inputs, {"output": response})
response
```


```python
inputs = {"input": "what did I ask you recently?"}
response = chain.invoke(inputs)
memory.save_context(inputs, {"output": response})
response
```
