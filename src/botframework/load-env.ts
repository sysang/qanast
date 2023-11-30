import { config } from 'dotenv'
import { z } from 'zod';

const EnvConfig = z.object({
  BF_SERVER_PORT: z.string(),
  MONGODB_CONNECTION: z.string(),
  MONGODB_REPLICA_SET: z.string(),
  MONGODB_DATABASE: z.string(),
  RABBITMQ_SERVER_ENDPOINT_URL: z.string(),
  LS_COMPLETION_ENDPOINT_URL: z.string(),
  LS_COMPLETION_ENDPOINT_PORT: z.string(),
  LS_COMPLETION_ENDPOINT_SCHEME: z.union([z.literal('http'), z.literal('https')]),
  LS_TRANSLATION_ENDPOINT_URL: z.string(),
  LS_TRANSLATION_ENDPOINT_PORT: z.string(),
  LS_TRANSLATION_ENDPOINT_SCHEME: z.union([z.literal('http'), z.literal('https')])
});

export type EnvConfigType = z.infer<typeof EnvConfig>;

const loadEnv = () => {
  const { parsed } = config();
  const variables = EnvConfig.parse(parsed);

  return () => variables;
}

export default loadEnv();
