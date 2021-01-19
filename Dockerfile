FROM node:alpine

ENV SP_BASE_URL = ""
ENV SP_CRED_USER = ""
ENV SP_CRED_PASS = ""
ENV SP_ROOT_FOLDER = ""
ENV SP_DELETE = "NOT-ALLOWED!"

VOLUME "/sharepoint"

WORKDIR /app
COPY . /app
RUN yarn

ENTRYPOINT yarn start
