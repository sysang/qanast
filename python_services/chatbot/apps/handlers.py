from pathlib import Path
from propan import RabbitRouter
from propan.annotations import Logger

from nemoguardrails import LLMRails, RailsConfig

# Load a guardrails configuration from the specified path.
fp = Path().resolve() / "rails"
config = RailsConfig.from_path(str(fp))
rails = LLMRails(config)

router = RabbitRouter()

@router.handle("llama2_chat")
async def llama2_chat(messages: list, logger: Logger):
    print('llama2_chat -> messages: ', messages);
    completion = await rails.generate_async(messages=messages)

    return completion
