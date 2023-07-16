---
jupyter:
  jupytext:
    cell_metadata_filter: -all
    formats: md,ipynb
    text_representation:
      extension: .md
      format_name: markdown
      format_version: '1.3'
      jupytext_version: 1.14.1
  kernelspec:
    display_name: Python 3
    language: python
    name: python3
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
import openai
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.environ.get('OPENAI_KEY')
print(openai.api_key)
```
