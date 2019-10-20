FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf libtool libxml2-dev libbz2-dev libgeos-dev libgeos++-dev \
    libproj-dev gdal-bin libmapnik-dev mapnik-utils python3-mapnik python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && ln -s /usr/bin/pip3 /usr/bin/pip

ENV MAPNIK_FONT_PATH=/fonts/

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

COPY render-map-service.py ./
COPY render.py ./

CMD ["python3", "render-map-service.py"]