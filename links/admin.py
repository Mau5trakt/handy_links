from django.contrib import admin

from .models import CustomUser, Folder, Link


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'password',
        'last_login',
        'is_superuser',
        'username',
        'first_name',
        'last_name',
        'email',
        'is_staff',
        'is_active',
        'date_joined',
        'avatar',
        'is_premium',
    )
    list_filter = (
        'last_login',
        'is_superuser',
        'is_staff',
        'is_active',
        'date_joined',
        'is_premium',
    )
    raw_id_fields = ('groups', 'user_permissions')


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'owner',
        'public',
        'created_at',
        'updated_at',
    )
    list_filter = ('owner', 'public', 'created_at', 'updated_at')
    raw_id_fields = ('collaborators', 'watchers')
    date_hierarchy = 'created_at'


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'folder',
        'title',
        'url',
        'owner',
        'description',
        'created_at',
        'updated_at',
    )
    list_filter = ('folder', 'owner', 'created_at', 'updated_at')
    #date_hierarchy = 'created_at'

