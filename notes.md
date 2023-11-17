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

## mongdb container
** link: https://www.mongodb.com/compatibility/deploying-a-mongodb-cluster-with-docker
```
docker run -d  -p 27017:27017 --name mongo1 --network mongoCluster mongo:7.0.2 mongod --replSet myReplicaSet --bind_ip localhost,mongo1
```
```
docker run -d  -p 27018:27017 --name mongo2 --network mongoCluster mongo:7.0.2 mongod --replSet myReplicaSet --bind_ip localhost,mongo2
```
```
docker run -d  -p 27019:27017 --name mongo3 --network mongoCluster mongo:7.0.2 mongod --replSet myReplicaSet --bind_ip localhost,mongo3
```
```
docker exec -it mongo1 mongosh --eval "rs.initiate({
 _id: \"myReplicaSet\",
 members: [
   {_id: 0, host: \"mongo1\"},
   {_id: 1, host: \"mongo2\"},
   {_id: 2, host: \"mongo3\"}
 ]
})"
```
```
127.0.0.1 mongo1
127.0.0.1 mongo2
127.0.0.1 mongo3
```
```
use admin
db.createUser(
  {
    user: "botframework",
    pwd: "111",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, 
             { role: "dbAdminAnyDatabase", db: "admin" }, 
             { role: "readWriteAnyDatabase", db: "admin" } ]
  }
)
```
