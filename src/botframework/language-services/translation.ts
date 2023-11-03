import { createAxiosClient } from '../http-client';
import loadEnv from '../load-env';

export default async function (
  src_text: string,
  src_lang: "en" | "vi",
  tgt_lang: "en" | "vi"
) {
  const { 
    LS_TRANSLATION_ENDPOINT_URL: url,
    LS_TRANSLATION_ENDPOINT_PORT: port,
    LS_TRANSLATION_ENDPOINT_SCHEME: scheme,
  } = loadEnv();
  const path = 'translate'
  const baseURL = `${scheme}://${url}:${port}`;
  const client = createAxiosClient(baseURL);

  const data = { src_text, src_lang, tgt_lang }

  const response = await client.post(path, data);

  return response.data.generated;
}
