#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.2
    done

    echo "PostgreSQL started"
fi

python manage.py flush --no-input
python manage.py migrate login zero
python manage.py makemigrations login
python manage.py migrate

cat pong_os/random_users.py  | python manage.py shell

exec "$@"