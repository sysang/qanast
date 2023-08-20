# Copyright 2020 gRPC authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""The Python AsyncIO implementation of the GRPC helloworld.Greeter server."""

import asyncio
import logging

import grpc

import helloworld_pb2
import helloworld_pb2_grpc
import newspaper_pb2
import newspaper_pb2_grpc

from newspaper import Article


class Greeter(helloworld_pb2_grpc.GreeterServicer):

    async def SayHello(
            self, request: helloworld_pb2.HelloRequest,
            context: grpc.aio.ServicerContext) -> helloworld_pb2.HelloReply:
        return helloworld_pb2.HelloReply(message='Hello, %s!' % request.name)


class Newspaper():

    async def Parse(
            self, request: newspaper_pb2.NewspaperRequest,
            context: grpc.aio.ServicerContext) -> newspaper_pb2.NewspaperReply:
        article = Article(url='', language='vi')
        article.set_html(request.html)
        article.parse()

        return newspaper_pb2.NewspaperReply(content=article.text)


async def serve() -> None:
    server = grpc.aio.server()
    helloworld_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    newspaper_pb2_grpc.add_NewspaperServicer_to_server(Newspaper(), server)
    # listen_addr = '[::]:50051'
    listen_addr = 'unix:/tmp/newspaper.sock'
    server.add_insecure_port(listen_addr)
    logging.info("Starting server on %s", listen_addr)
    await server.start()
    await server.wait_for_termination()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    asyncio.run(serve())
