FROM map1/render-map

RUN apt-get update && apt-get install -y --no-install-recommends \
    jupyter-notebook

EXPOSE 8888

ENV XDG_DATA_HOME=/tmp

WORKDIR /notebooks

CMD ["jupyter", "notebook", "--port=8888", "--no-browser", "--ip=0.0.0.0","--allow-root"]


