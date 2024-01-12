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
python manage.py makemigrations
python manage.py migrate
echo "from login.models import UserProfile; UserProfile.objects.create_superuser('admin', 'admin@admin.com', 'admin')" | python manage.py shell

exec "$@"