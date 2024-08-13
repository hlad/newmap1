FROM python:3

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /usr/src/app/
WORKDIR /usr/src/app

CMD ["python3","calc-densities.py"]
