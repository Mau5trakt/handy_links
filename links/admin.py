from django.contrib import admin
from django.utils.html import format_html
from .models import CustomUser, Folder, Link
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm



@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    list_display = (
        'id',
        'username',
        'is_superuser',
        'email',
        'display_avatar',
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
    
    def display_avatar(self, obj):
        if obj.avatar:  
            return format_html('<img src="{}" width="24" height="24" style="border-radius: 50%;" />', obj.avatar)
        return "No avatar"
    display_avatar.short_description = 'Avatar'  




@admin.register(Folder)
class FolderAdmin(ModelAdmin):


    list_display = (
        'id',
        'title',
        'owner',
        'public',
        'created_at',
        'updated_at',
        'status',
    )
    list_filter = ('owner', 'public', 'created_at', 'updated_at', 'status')
    raw_id_fields = ('collaborators', 'watchers')
    #date_hierarchy = 'created_at'


@admin.register(Link)
class LinkAdmin(ModelAdmin):
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

