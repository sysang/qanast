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
from scipy.spatial.distance import cosine
from sentence_transformers import SentenceTransformer
```
```python
model = SentenceTransformer("bigscience-data/sgpt-bloom-1b7-nli")
```
```python
texts = [
    "deep learning",
    "artificial intelligence",
    "deep diving",
    "artificial snow",
]
embeddings = model.encode(texts)
```
```python
cosine_sim_0_1 = 1 - cosine(embeddings[0], embeddings[1])
cosine_sim_0_2 = 1 - cosine(embeddings[0], embeddings[2])
cosine_sim_0_3 = 1 - cosine(embeddings[0], embeddings[3])

print("Cosine similarity between \"%s\" and \"%s\" is: %.3f" % (texts[0], texts[1], cosine_sim_0_1))
print("Cosine similarity between \"%s\" and \"%s\" is: %.3f" % (texts[0], texts[2], cosine_sim_0_2))
print("Cosine similarity between \"%s\" and \"%s\" is: %.3f" % (texts[0], texts[3], cosine_sim_0_3))
```
