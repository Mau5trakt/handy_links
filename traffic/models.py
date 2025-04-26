from django.db import models

# Create your models here.

class RouteLog(models.Model):
    route = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(auto_now_add=True)

class RouteCount(models.Model):
    route = models.CharField(max_length=1000, unique=True)
    count = models.PositiveIntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)

    @classmethod
    def increment_count(cls, route_path):
        obj, created = cls.objects.get_or_create(
            route=route_path,
            defaults={'count': 1}
        )

        if not created:
            obj.count = models.F('count') + 1
            obj.save(update_fields=['count'])

