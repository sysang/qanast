from pathlib import Path
import json
import re

import meilisearch


client = meilisearch.Client('http://192.168.58.9:7700')

def is_json_file(fname):
  is_jlext_p = re.compile('\.json$')
  return is_jlext_p.search(fname) is not None

path_obj = Path('my-crawler/storage/datasets/default')
data = []
for file in path_obj.iterdir():
    if not is_json_file(file.name):
        continue

    with open(file.absolute()) as json_file:
        doc = json.load(json_file)
        doc['id'] = doc['hashed']
        data.append(doc)
        print(doc['title'])

client.index('leteemartdalat').add_documents(data)
