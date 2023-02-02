# Tally

## Installation Instructions

```sh
$ lsb_release -d
Description:	Ubuntu 22.04.1 LTS
$ sh -c "$(curl -fsSL https://get.docker.com)"
$ docker -v
Docker version 20.10.23, build 7155243
$ git clone https://github.com/rojul/tally.git
$ git clone https://github.com/rojul/tally-web.git tally/nginx/tally-web
$ cd tally
$ docker compose up --build -d
$ # Die App ist auf http://localhost:80/ verfügbar
$ # Tally auf der Einstellungsseite konfigurieren
$ docker compose logs --tail 1000 -f
```
