FROM python:3.6.6-alpine3.6

RUN apk update && apk add libressl-dev postgresql-dev libffi-dev gcc musl-dev python3-dev 

# Install GCC:
RUN apk add build-base
RUN pip install --upgrade pip

# Copy application files:
COPY . /application/
WORKDIR /application/

# Installing dependencies:
RUN pip install -r requirements.txt

# Install custom packages:
# RUN pip install .

# Expose port:
EXPOSE 8000

# Upon firing up the container, the app starts:
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]

