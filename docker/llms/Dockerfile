FROM alpine:3.18.3

RUN apk update && apk upgrade --no-cache \
    && apk add openblas-dev make g++ git

COPY ./llama.cpp /llamacpp
WORKDIR /llamacpp
RUN make LLAMA_OPENBLAS=1

ENTRYPOINT ["tail", "-f", "/dev/null"]

