# pull official base image
FROM python:3.11.4-slim-buster

# set work directory
WORKDIR /app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install system dependencies
RUN apt-get update

# install dependencies
RUN pip install --upgrade pip

COPY ./srcs/requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt && apt install -y netcat \
	&& pip install pyotp && pip install django-cors-headers && pip install djangorestframework && pip install djangorestframework-simplejwt[crypto]

# copy entrypoint.sh
COPY ./srcs/ /app
# COPY ./entrypoint.sh /app
RUN chmod +x /app/entrypoint.sh

# copy project
COPY ./srcs .

EXPOSE 8000

# run entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
