FROM python:2

RUN apt-get update && apt-get install -y --no-install-recommends imagemagick \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app


COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "./generate_osmcsymbols.sh" ]