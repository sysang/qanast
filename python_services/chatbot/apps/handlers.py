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
async def llama2_chat(m: str, logger: Logger):
    logger.info(m)
    completion = await rails.generate_async(
        messages=[{"role": "user", "content": "Hello world!"}]
    )

    print("completion: ", completion)
    return completion
