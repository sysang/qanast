import logging
from typing import Optional

import anyio
from propan import PropanApp, RabbitBroker
from propan.annotations import RabbitBroker as Broker, ContextRepo

from config import init_settings
from apps import router


broker = RabbitBroker()
broker.include_router(router)

app = PropanApp(broker)


@app.on_startup
async def init_app(broker: Broker, context: ContextRepo, env: Optional[str] = None):
    settings = init_settings(env)
    context.set_global("settings", settings)

    logger_level = logging.DEBUG if settings.debug else logging.INFO
    app.logger.setLevel(logger_level)
    broker.logger.setLevel(logger_level)

    await broker.connect(settings.broker.url)


if __name__ == "__main__":
    anyio.run(app.run)