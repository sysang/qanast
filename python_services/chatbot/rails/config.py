from nemoguardrails.llm.providers import register_llm_provider

from custom_llms import MyLamma2

register_llm_provider("my_llama2", MyLamma2)
