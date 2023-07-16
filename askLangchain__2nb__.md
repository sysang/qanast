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


```javascript
var nb = IPython.notebook;
var kernel = IPython.notebook.kernel;
var command = "NOTEBOOK_FULL_PATH = '" + nb.base_url + nb.notebook_path + "'";
kernel.execute(command);
```

```python
# The working notebook file path is stored in NOTEBOOK_FULL_PATH
# Change working directory to project root which is parent of NOTEBOOK_FULL_PATH
# Typing Shift + Enter on obove cell to help proper javascript execution

import os
import time
from pathlib import Path
from jupyter_core.paths import jupyter_config_dir
from traitlets.config import Config

def get_config():
  return Config()

config_file = os.path.join(jupyter_config_dir(), 'jupyter_notebook_config.py')
config_content = open(config_file).read()
c = get_config()
exec(config_content)
root_dir = c['ContentsManager']['root_dir']
project_root = Path(root_dir + NOTEBOOK_FULL_PATH).parent
print(f'Working directory has been changed to {project_root}')
os.chdir(project_root)
os.listdir('./')
```

```python
from dotenv import load_dotenv
load_dotenv()
```

```python
import openai
from langchain.llms import OpenAI

llm = OpenAI(model_name="text-davinci-003", temperature=0)
```

```python
import textwrap

# print("\n".join(textwrap.wrap(llm("What is LangChain?").strip())))
```

```python
import requests

toplevel = "https://python.langchain.com/docs/get_started/introduction"
response = requests.get(toplevel)
response
```

```python
from IPython import display

display.HTML(data=response.text)
```

```python
from bs4 import BeautifulSoup

soup = BeautifulSoup(response.text, 'html.parser')
print(soup.prettify())
```

```python
anchors_attrs = [anchor.attrs for anchor in soup.find_all('a')]
print(len(anchors_attrs))
print(anchors_attrs[0])
```

```python
from langchain_doc_sitemap import sitemap

urls = [item['loc'] for item in sitemap['urlset']['url'] ]
urls
```

```python
%%time
import requests

pages = []

for url in urls[0:99]:
    try:
        resp = requests.get(url)
        resp.raise_for_status()
    except Exception:
        print(url)
    finally:
        pages.append({"content": resp.content, "url": url})

```

```python
pages[11]
```

```python
import nltk
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
```

```python
%%time
from unstructured.partition.html import partition_html

parsed_docs = [partition_html(text=page["content"]) for page in pages]
```

```python
parsed_docs[11]
```

```python
texts = []
for doc in parsed_docs:
    texts.append("\n\n".join(
        [str(el).strip() for el in doc if el.category == 'NarrativeText']).strip().replace("\\n", ""))
```

```python
texts[11]
```

```python
print(*textwrap.wrap(texts[0]), sep="\n")
```

```python
for page, text in zip(pages, texts):
    page["text"] = text

pages[0].keys()
```

```python
from langchain.text_splitter import CharacterTextSplitter

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=1024, chunk_overlap=128, separator=" ")

documents = text_splitter.create_documents(
    [page["text"] for page in pages], metadatas=[{"source": page["url"]} for page in pages])
```

```python
print(documents[11].metadata["source"], *textwrap.wrap(documents[11].page_content), sep="\n")

counter = 0
for page in pages:
    counter += len(pages[0]['text'].split())
print('number of token: ', counter)
```

```python
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from langchain.vectorstores import FAISS

embeddings = OpenAIEmbeddings()
docsearch = FAISS.from_documents(documents, embeddings)

chain = load_qa_with_sources_chain(llm, chain_type="stuff")
```

```python

def ask_for_answer(query):

    docs = docsearch.similarity_search(query)
    print('context: ', [ doc.metadata for doc in docs])
    result = chain({"input_documents": docs, "question": query})

    text = "\n".join(textwrap.wrap(result["output_text"]))
    text = "\n\nSOURCES:\n".join(map(lambda s: s.strip(), text.split("SOURCES:")))

    print('answer: ', text)

    return result
```

```python
print(chain.llm_chain.prompt.template)
```

```python
query = "What is LangChain?"
# query = "What is LangChainHub?"
# query = "Does LangChain integrate with OpenAI? If so, how?"

result = ask_for_answer(query)
print(*textwrap.wrap(result["input_documents"][0].page_content), sep="\n")
```
