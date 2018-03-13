FROM node:8.10-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .

HEALTHCHECK CMD [ "wget", "--spider", "http://127.0.0.1/api/health" ]

CMD [ "npm", "start" ]
