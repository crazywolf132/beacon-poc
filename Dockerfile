FROM node:22-bookworm
COPY ./dist/client.js index.js
COPY ./package.json package.json
ENV PORT=5050
ENV MANAGER_PORT=8456
ENV SERVICE_ID=123456
ENTRYPOINT node ./index.js