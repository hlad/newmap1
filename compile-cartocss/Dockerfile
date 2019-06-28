FROM php:7.2-cli

RUN apt-get update && apt-get install -y --no-install-recommends libmagickwand-dev \
    && pecl install imagick \
    && docker-php-ext-enable imagick \
    && rm -rf /var/lib/apt/lists/*

VOLUME /shield
VOLUME /symbol
VOLUME /pattern
VOLUME /cartocss

COPY . /usr/src/app/
WORKDIR /usr/src/app

CMD ["./generate_cartocss.sh"]
