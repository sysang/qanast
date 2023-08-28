## meilisearch
`docker run -d \                                                                                                              sysang@AILab2020
    -p 7700:7700 \
    -e MEILI_ENV='development' \
    -v $(pwd)/meili_data:/meili_data \
    --name meilisearch_server \
    getmeili/meilisearch:v1.2`

## mongodb
`docker run -d \
    -e MONGO_INITDB_ROOT_USERNAME=botbuilder -e MONGO_INITDB_ROOT_PASSWORD=qwer1234 \
    -p 27017:27017  \
    -v $(pwd)/mongodb_data:/data/db \
    --name mongodb_server \
    mongodb/mongodb-community-server:6.0.7-ubi8`

## run llm2
`docker run -d \
    --name llm2 \
    -v /home/sysang/workspace/ailab/qna-assistant/docker/llms/models:/models \
    -p 8102:8102 llamacpp:3.18-b1076`

## exec llm2
`docker exec -d llm2 sh -c \
"/llamacpp/server -t 2 -m /models/llama-2-13b-chat.ggmlv3.q2_K.gguf -c 4096 --no-mmap --host 0.0.0.0 --port 8102"`

## run llm1
`docker run -d \
    --name llm1 \
    -v /home/sysang/workspace/ailab/qna-assistant/docker/llms/models:/models \
    -p 8101:8101 llamacpp:3.18-b1076`

## exec llm1
`docker exec -d llm1 sh -c \
"/llamacpp/server -t 2 -m /models/llama-2-7b-chat.ggmlv3.q3_K_L.gguf -c 2048 --no-mmap --host 0.0.0.0 --port 8101"`
