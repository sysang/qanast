import { Agent } from 'node:http';

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import fastJson from 'fast-json-stringify';

import { createRequestLogger } from './logging/pino';

const stringify = fastJson({
  title: 'Axios Request Config Schema',
  type: 'object',
  properties: {
    baseURL: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    method: {
      type: 'string'
    }
  },
  required: []
})

const createAxiosClient = (baseURL?: string): AxiosInstance => {
  const defaultHeaders = {
    accept: 'application/json',
    'content-type': 'application/json'
  }

  const httpAgent = new Agent();
  const client = axios.create({
    baseURL,
    httpAgent,
    headers: defaultHeaders
  });

  client.interceptors.request.use(
    (config) => config,
    async function (error: AxiosError) {
      const logger = await createRequestLogger();
      logger.error(`Request to [${stringify(error.config!)}] got error, code: ${error.code}, message: ${error.message}`);
      return await Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    async function (error: AxiosError) {
      const logger = await createRequestLogger();
      logger.error(`Request to [${stringify(error.config!)}] got error, code: ${error.code}, message: ${error.message}`);
      return await Promise.reject(error);
    }
  );

  return client;
}

export { createAxiosClient }
