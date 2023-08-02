/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import path from 'path';
import { fileURLToPath } from 'url';

import parseArgs from 'minimist';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = __dirname + '/../../../grpc_protos/newspaper.proto';

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const newspaper_proto = grpc.loadPackageDefinition(packageDefinition).newspaper;

const parseHtml = async (html) => {
  const target = 'unix:/tmp/newspaper.sock';

  const client = new newspaper_proto.Newspaper(
    target, 
    grpc.credentials.createInsecure());

  return new Promise((resolve, reject) => {
    client.parse({html: html}, function(err, response) {
      if (err) {
        return reject(error)
      }

      resolve(response);
    });
  })
}

export default parseHtml;
