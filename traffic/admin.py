from django.contrib import admin
from .models import RouteLog, RouteCount
from unfold.admin import ModelAdmin

@admin.register(RouteLog)
class RouteLogAdmin(ModelAdmin):
    list_display = ('route', 'timestamp')
    list_filter = ('route', 'timestamp')


@admin.register(RouteCount)
class RouteCountAdmin(ModelAdmin):
    list_display = ('route', 'count', 'last_accessed')
    list_filter = ('route', 'count', 'last_accessed')

