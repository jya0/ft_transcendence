# Import necessary modules
from login.models import UserProfile, Friendship
from faker import Faker

# Create a Faker instance
fake = Faker()

# Specify the number of users you want to create
num_users = 10

# Loop to create users with random data
for _ in range(num_users):
    # Generate random data
    username = fake.user_name()
    email = fake.email()
    display_name = fake.name()
    import random

    image = f'https://picsum.photos/{random.randint(100, 1000)}/{random.randint(100, 1000)}'
    picture = {
        'link': image
    }

    # Create a user profile and set the display name
    profile = UserProfile.objects.create(
        username=username, intra=username,email=email, display_name=display_name, picture=picture)

u1 = UserProfile.objects.all()[0]
u2 = UserProfile.objects.all()[1]
u3 = UserProfile.objects.all()[2]
u4 = UserProfile.objects.all()[3]
u5 = UserProfile.objects.all()[4]
Friendship.objects.create(id1=u2,id2=u1)
Friendship.objects.create(id1=u2,id2=u3)
Friendship.objects.create(id1=u2,id2=u4)
Friendship.objects.create(id1=u2,id2=u5)