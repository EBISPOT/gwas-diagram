FROM python:3.11.2

# Configure Poetry
ENV POETRY_VERSION=1.3.2
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VENV=/opt/poetry-venv
ENV POETRY_CACHE_DIR=/opt/.cache

# Install system dependencies
#RUN apk update && apk add gcc build-base

# Install poetry separated from system interpreter
RUN python3 -m venv $POETRY_VENV \
    && $POETRY_VENV/bin/pip install -U pip setuptools \
    && $POETRY_VENV/bin/pip install poetry==${POETRY_VERSION}

# Add `poetry` to PATH
ENV PATH="${PATH}:${POETRY_VENV}/bin"

WORKDIR /application

# Install dependencies
COPY . /application/
RUN poetry install

# Expose port:
EXPOSE 8000

# Upon firing up the container, the app starts:
CMD ["poetry", "run", "uvicorn", "gwas_diagram.main:app", "--host", "0.0.0.0", "--port", "8000", "--timeout-keep-alive", "1000"]