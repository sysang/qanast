## Generate grpc code
`python -m grpc_tools.protoc -I./grpc_protos --python_out=./python_services --pyi_out=./python_services --grpc_python_out=./python_services ./grpc_protos/newspaper.proto`

## postgresql container
```
docker run -d \
    -e POSTGRES_PASSWORD=111 \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    --user "$(id -u):$(id -g)" \
    -v /etc/passwd:/etc/passwd:ro \
    -v /home/sysang/workspace/ailab/qna-assistant/pgdata:/var/lib/postgresql/data \
    -p 5432:15432 \
    --name mypostgresql \
    postgres:15.4-bullseye
```
