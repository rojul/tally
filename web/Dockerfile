FROM nginx:1.11.4-alpine

WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/
COPY dist .

RUN echo ok > health
HEALTHCHECK CMD [ "wget", "-s", "http://localhost:80/health" ]
