FROM node:8.10-alpine AS build

WORKDIR /app

RUN apk add --no-cache g++ make python \
    && npm install node-sass@4.7.2 \
    && apk del g++ make python

COPY tally-web/package*.json .
RUN npm install

COPY tally-web .
RUN npm run build

FROM nginx:1.23.3-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
