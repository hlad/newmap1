FROM php:7.2-cli

RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && rm -rf /var/lib/apt/lists/*

ENV SQL_DIR=/sql

VOLUME /sql

COPY . /usr/src/app/
WORKDIR /usr/src/app

CMD ["./generate_sql.sh"]
