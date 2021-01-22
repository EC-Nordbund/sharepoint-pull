FROM node:15.6.0-alpine

VOLUME "/sharepoint"

WORKDIR /app
COPY . /app
RUN yarn

ENTRYPOINT yarn start
