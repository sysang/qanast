import { config } from 'dotenv'
import { z } from 'zod';

const EnvConfig = z.object({
  BF_SERVER_PORT: z.string(),
  MONGODB_CONNECTION: z.string(),
  MONGODB_DATABASE: z.string(),
  LS_COMPLETION_ENDPOINT: z.string()
});

export type EnvConfigType = z.infer<typeof EnvConfig>;

const loadEnv = () => {
  const { parsed } = config();
  const variables = EnvConfig.parse(parsed);

  return () => variables;
}

export default loadEnv();
