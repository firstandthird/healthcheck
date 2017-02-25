FROM firstandthird/node:6.10-2-onbuild

USER root
RUN apk --update --no-cache --virtual add iputils
USER node

EXPOSE 8080

