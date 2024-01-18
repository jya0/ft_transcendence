# Import necessary modules
from login.models import UserProfile
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
        username=username, email=email, display_name=display_name, picture=picture)

    print(
        f'User "{username}" created successfully with email "{email}" and display name "{display_name}".')
