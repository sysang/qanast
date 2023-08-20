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
