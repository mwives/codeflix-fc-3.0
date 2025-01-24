# Use golang:alpine as the base image
FROM golang:1.23-alpine

# Install additional dependencies and Bento4
RUN apk add --no-cache \
  bash \
  git \
  build-base \
  ca-certificates \
  && apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community/ bento4

# Set the working directory
WORKDIR /go/src/

# Keep the container running
CMD ["tail", "-f", "/dev/null"]
