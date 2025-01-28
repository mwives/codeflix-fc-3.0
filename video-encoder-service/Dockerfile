FROM golang:1.23-alpine

RUN apk add --no-cache \
  bash \
  git \
  build-base \
  cmake \
  python3 \
  py3-pip \
  ca-certificates

WORKDIR /go/src/

RUN git clone https://github.com/axiomatic-systems/Bento4.git && \
  cd Bento4 && \
  mkdir cmakebuild && \
  cd cmakebuild && \
  cmake -DCMAKE_BUILD_TYPE=Release .. && \
  make && \
  make install

RUN cp -r /go/src/Bento4/Source/Python/utils /usr/local/bin && \
  cp -r /go/src/Bento4/Source/Python/wrappers /usr/local/bin

ENV PATH="/usr/local/bin/wrappers:${PATH}"

CMD ["tail", "-f", "/dev/null"]
