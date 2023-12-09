from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.contrib.auth.decorators import login_required
import os

FORTY_TWO_URL = os.environ.get("FORTY_TWO_URL")


def image_upload(request):
    if request.method == "POST" and request.FILES["image_file"]:
        image_file = request.FILES["image_file"]
        fs = FileSystemStorage()
        filename = fs.save(image_file.name, image_file)
        image_url = fs.url(filename)
        print(image_url)
        return render(request, "home.html", {
            "image_url": image_url, 'FORTY_TWO_URL': FORTY_TWO_URL
        })
    return render(request, "home.html", {
        'FORTY_TWO_URL': FORTY_TWO_URL
    })
