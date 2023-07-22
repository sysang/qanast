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
from dotenv import load_dotenv
from typing import Optional, Type
import arrow

from langchain.chat_models import ChatOpenAI
from langchain.experimental.plan_and_execute import PlanAndExecute, load_agent_executor, load_chat_planner
from langchain.llms import OpenAI
from langchain import SerpAPIWrapper
from langchain.agents.tools import Tool
from langchain import LLMMathChain
from langchain.tools.base import BaseTool
from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain.utilities.duckduckgo_search import DuckDuckGoSearchAPIWrapper


load_dotenv()
```

```python
class CurrentDateTimeIndicator(BaseTool):
    name = 'current_date_time'
    description = "Useful for when you need to know current date or current time"

    def _run(
        self, query: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        utc = arrow.utcnow()
        return utc.format('HH:mm:ss dddd, MMMM D, YYYY')

    async def _arun(
        self, query: str, run_manager: Optional[AsyncCallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool asynchronously."""
        raise NotImplementedError("custom_search does not support async")

current_date_time_tool = CurrentDateTimeIndicator()
current_date_time_tool.run(tool_input={'query': None})
```

```python
search = DuckDuckGoSearchAPIWrapper()
search.run("Leo DiCaprio's girlfriend current age")
```

```python
llm = OpenAI(temperature=0)
llm_math_chain = LLMMathChain.from_llm(llm=llm, verbose=True)
tools = [
    Tool(
        name = "Search",
        func=search.run,
        description="useful for when you need to answer questions about current events"
    ),
    Tool(
        name="Calculator",
        func=llm_math_chain.run,
        description="useful for when you need to answer questions about math"
    ),
    current_date_time_tool,
]
model = ChatOpenAI(temperature=0)
planner = load_chat_planner(model)
executor = load_agent_executor(model, tools, verbose=True)
agent = PlanAndExecute(planner=planner, executor=executor, verbose=True)
```

```python
agent.run("Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?")
```

```python
agent.run("How many years from now Qatar worldcup happened")
```
