FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends gdal-bin python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && ln -s /usr/bin/pip3 /usr/bin/pip

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

CMD ["python","calc-densities.py"]