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

ENV GDAL_VERSION 2.4.1
ENV OPENJPEG_VERSION 2.3.0

ENV GDAL_BUILD_DEPENDENCIES="build-essential python-dev python3-dev"

ENV GDAL_DEPENDENCIES="software-properties-common \
    build-essential \
    libspatialite-dev \
    sqlite3 \
    libpq-dev \
    libcurl4-gnutls-dev \
    libproj-dev \
    libxml2-dev \
    libgeos-dev \
    libnetcdf-dev \
    libpoppler-dev \
    libspatialite-dev \
    libhdf4-alt-dev \
    libhdf5-serial-dev \
    bash-completion \
    cmake"

WORKDIR /usr/src

ADD http://download.osgeo.org/gdal/${GDAL_VERSION}/gdal-${GDAL_VERSION}.tar.gz /usr/src/gdal-${GDAL_VERSION}.tar.gz
ADD https://github.com/uclouvain/openjpeg/archive/v${OPENJPEG_VERSION}.tar.gz /usr/src/openjpeg-${OPENJPEG_VERSION}.tar.gz

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        $GDAL_BUILD_DEPENDENCIES $GDAL_DEPENDENCIES \
    && cd /usr/src && tar -xvf openjpeg-${OPENJPEG_VERSION}.tar.gz && cd openjpeg-${OPENJPEG_VERSION}/ \
    && mkdir build && cd build \
    && cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$ROOTDIR \
    && make && make install && make clean \
    && rm -r /usr/src/openjpeg-${OPENJPEG_VERSION} && rm /usr/src/openjpeg-${OPENJPEG_VERSION}.tar.gz\
    && cd /usr/src && tar -xvf gdal-${GDAL_VERSION}.tar.gz && cd gdal-${GDAL_VERSION} \
    && ./configure --with-python --with-spatialite --with-pg --with-curl --with-openjpeg \
    && make -j $(nproc) && make install && ldconfig \
    && apt-get update -y \
    && cd /usr/src/gdal-${GDAL_VERSION}/swig/python \
    && python3 setup.py build \
    && python3 setup.py install \
    && rm -r /usr/src/gdal-${GDAL_VERSION} && rm /usr/src/gdal-${GDAL_VERSION}.tar.gz \
    && apt-get autoremove -y --purge $BUILD_DEPENDENCIES \
    && rm -rf /var/lib/apt/lists/*


VOLUME /render

COPY . /usr/src/app/
WORKDIR /usr/src/app

CMD ["./render-map.sh"]
