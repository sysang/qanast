import asyncio

from propan import RabbitBroker


async def main() -> None:
    async with RabbitBroker("amqp://rabbituser:111@192.168.58.9:5672/") as broker:
        r = await broker.publish(
            "hi!", "llama2_chat",
            callback=True,
            callback_timeout=120
        )

    print("response: %s" % r)


if __name__ == "__main__":
    asyncio.run(main())
