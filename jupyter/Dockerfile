FROM map1/render-map

RUN apt-get update && apt-get install -y --no-install-recommends jupyter-notebook libgdal-dev python3-setuptools python3-gdal \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 8888

ENV XDG_DATA_HOME=/tmp

WORKDIR /notebooks

CMD ["jupyter", "notebook", "--port=8888", "--no-browser", "--ip=0.0.0.0","--allow-root"]


