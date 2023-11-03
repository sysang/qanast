from typing import Union

from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

from fastapi import FastAPI
from pydantic import BaseModel
from cachetools import cached, TTLCache

model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")
tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")

class Params(BaseModel):
    src_text: str
    src_lang: str
    tgt_lang: str

@cached(cache=TTLCache(maxsize=1024, ttl=20))
def translate(src_text, src_lang, tgt_lang):
    tokenizer.src_lang = src_lang
    encoded = tokenizer(src_text, return_tensors="pt")
    generated_tokens = model.generate(**encoded, forced_bos_token_id=tokenizer.get_lang_id(tgt_lang))
    generated = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)

    return generated[0]

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/translate")
def read_item(params: Params):
    generated = translate(params.src_text, params.src_lang, params.tgt_lang)
    return { "generated": generated }

