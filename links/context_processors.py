from django.conf import settings

def globals(request):

    data = dict(
        PROJECT_NAME = getattr(settings, "PROJECT_NAME"),
        folder_img = "https://placehold.co/100x100/579dff/FFF?text=%3Ca%3E",
    )

    return data

