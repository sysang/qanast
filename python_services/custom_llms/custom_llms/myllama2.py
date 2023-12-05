from typing import Any, List, Mapping, Optional
import json

from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.base_language import BaseLanguageModel
from langchain.llms.base import LLM
import requests

class MyLamma2(LLM):
    temperature: float 

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

        max_tokens = 1000
        api_url = 'http://192.168.58.9:3000/v1/completions'
        headers = { 'Content-Type' : 'application/json' }

        print('[DEBUG] myllama2 -> prompt: ', prompt)

        data = {
            'prompt': prompt,
            'stop': ["</s>"],
            'max_tokens': max_tokens,
            'temperature': 0.1,
            'top_p': 0.95,
            'top_k': 19
        }
        r = requests.post(
            api_url,
            headers=headers,
            data=json.dumps(data),
            timeout=1200)

        response_data = r.json()
        print('[DEBUG] myllama2 -> response_data: ')
        print(response_data)

        return response_data['choices'][0]['text']
