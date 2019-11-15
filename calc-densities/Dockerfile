FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends software-properties-common python3-gdal python3-setuptools python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && ln -s /usr/bin/pip3 /usr/bin/pip

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /usr/src/app/
WORKDIR /usr/src/app

CMD ["python3","calc-densities.py"]
