import re
from typing import Union

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

from fastapi import FastAPI
from pydantic import BaseModel
from cachetools import cached, TTLCache

model_name = "VietAI/envit5-translation"
tokenizer = AutoTokenizer.from_pretrained(model_name)  
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

class Params(BaseModel):
    src_text: str
    src_lang: str
    tgt_lang: str

@cached(cache=TTLCache(maxsize=1024, ttl=20))
def translate(src_text, src_lang, tgt_lang):
    inputs = [
        f"{src_lang}: {src_text}"
    ]
    outputs = model.generate(tokenizer(
        inputs, return_tensors="pt", padding=True).input_ids.to('cpu'), max_length=2048)

    decoded = tokenizer.batch_decode(outputs, skip_special_tokens=True);

    if len(decoded) == 0:
        return src_text

    regx = re.compile(r"(?:vi|en)\:\s(.+)")
    matched = regx.fullmatch(decoded[0]);

    if matched is None:
        return src_text

    return matched.groups()[0];

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/translate")
def read_item(params: Params):
    generated = translate(params.src_text, params.src_lang, params.tgt_lang)
    return { "generated": generated }

