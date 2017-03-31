FROM mariadb:10.1.17

ENV MYSQL_USER=tally
ENV MYSQL_RANDOM_ROOT_PASSWORD=yes

COPY dump.sql /docker-entrypoint-initdb.d/

HEALTHCHECK CMD mysql -utally -p${MYSQL_PASSWORD} -Dtally -e'select 1+1;'

EXPOSE 3306
