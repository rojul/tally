FROM mariadb:10.2

ENV MYSQL_USER=tally \
    MYSQL_DATABASE=tally

COPY dump.sql /docker-entrypoint-initdb.d/

HEALTHCHECK CMD mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -D$MYSQL_DATABASE -e'select 1+1;'

EXPOSE 3306
