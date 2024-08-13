FROM ubuntu:20.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates && \
    apt-get install -y --no-install-recommends gdal-bin libgdal-dev nodejs npm && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g carto

VOLUME /mapnik-styles

COPY . /usr/src/app/
WORKDIR /usr/src/app

CMD ["./compile_cartocss.sh"]
