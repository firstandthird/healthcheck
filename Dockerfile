FROM firstandthird/node:8.8-onbuild

RUN apk --update --no-cache --virtual add iputils
RUN mkdir -p $HOME/log

ENV LOG_PATH $HOME/log/healthcheck.json

EXPOSE 8080

