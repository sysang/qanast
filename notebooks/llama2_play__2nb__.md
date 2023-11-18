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
import json
import requests
```

```python
prompt = "<s>[INST] <<SYS>>\n You are a helpful, respectful and honest assistant. Your answer is always as concise as possible, while being informative, sufficient. Please ensure that your responses are truthful, inspiring, positive. Please do not response to question thas is inappropriate or contradictory. If you don't know the answer to a question, please don't share false information\n<</SYS>>\n\n Describe 10 fundamental steps to build a ecoomerce website [/INST]"
headers = { 'Content-Type' : 'application/json' }
data = {
    'prompt': prompt,
    "stop": ["</s>"],
    "max_tokens": 1000
}
r = requests.post(
    'http://192.168.58.9:3000/v1/completions',
    headers=headers,
    data=json.dumps(data),
    timeout=1200)
r.text
```
