FROM python:3

ENV MAPNIK_VERSION v3.0.22

ENV MAPNIK_BUILD_DEPENDENCIES="build-essential \
    ca-certificates \
    git \
    icu-devtools \
    libboost-dev \
    libboost-filesystem-dev \
    libboost-program-options-dev \
    libboost-regex-dev \
    libboost-thread-dev \
    libboost-system-dev \
    libcairo-dev \
    libfreetype6-dev \
    libgdal-dev \
    libharfbuzz-dev \
    libicu-dev \
    libjpeg-dev \
    libpq-dev  \
    libproj-dev \
    librasterlite2-dev \
    libsqlite3-dev \
    libtiff-dev \
    libwebp-dev"

ENV MAPNIK_DEPENDENCIES="libboost-filesystem1.62.0 \
    libboost-program-options1.62.0 \
    libboost-regex1.62.0 \
    libboost-thread1.62.0 \
    libboost-system1.62.0 \
    libcairo2 \
    libfreetype6 \
    libgdal20 \
    libharfbuzz-gobject0 \
    libharfbuzz-icu0 \
    libharfbuzz0b \
    libicu57 \
    libjpeg62-turbo \
    libpq5 \
    libproj12 \
    librasterlite2-1 \
    libsqlite3-0 \
    libtiff5 \
    libtiffxx5 \
    libwebp6  \
    libwebpdemux2 \
    libwebpmux2"


RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        $MAPNIK_BUILD_DEPENDENCIES $MAPNIK_DEPENDENCIES \
    && git clone https://github.com/mapnik/mapnik.git \
    && cd mapnik \
    && git checkout $MAPNIK_VERSION \
    && git submodule update --init \
    && python scons/scons.py INPUT_PLUGINS='all' \
    && make -j $(nproc) && make install && ldconfig\
    && cd - \
    && rm -r mapnik \
    && apt-get autoremove -y --purge $MAPNIK_BUILD_DEPENDENCIES \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/local/lib/mapnik /usr/lib/mapnik


VOLUME /render

COPY . /usr/src/app/
WORKDIR /usr/src/app

CMD ["./render-map.sh"]
