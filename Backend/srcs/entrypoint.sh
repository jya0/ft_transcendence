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
python manage.py makemigrations login
python manage.py migrate

#Here we create 1 admin and 2 dummy users to denote empty or semi complete game lobbies:
echo "from login.models import UserProfile; UserProfile.objects.create_superuser('admin', 'admin@admin.com', 'admin')" | python manage.py shell
echo "from login.models import UserProfile; UserProfile.objects.create_superuser('temp1', 'temp1@temp1.com', 'temp1')" | python manage.py shell
echo "from login.models import UserProfile; UserProfile.objects.create_superuser('temp2', 'temp2@temp2.com', 'temp2')" | python manage.py shell

#A dummy tournament is also created to link to online 1v1 games with no asssociated tournament:
echo "from login.models import UserProfile, Tournament, Match; \
Tournament.objects.create(status=True); \
dummy = Tournament.objects.all()[0]; \
Match.objects.create(tournament_id_id=dummy.tournament_id, id1_id=2, id2_id=3, score1=0, score2=0, ongoing=False);" | python manage.py shell

exec "$@"