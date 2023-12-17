#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

python manage.py flush --no-input
python manage.py makemigrations
python manage.py migrate
echo "from authentication.models import UserProfile; UserProfile.objects.create_superuser('admin', 'admin@admin.com', 'admin')" | python manage.py shell

exec "$@"