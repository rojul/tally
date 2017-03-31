FROM node:7-alpine

WORKDIR /usr/src/app

COPY package.json .
RUN npm install --production
COPY . .

HEALTHCHECK CMD [ "wget", "-s", "http://localhost:80/api/health" ]

CMD [ "npm", "start" ]
