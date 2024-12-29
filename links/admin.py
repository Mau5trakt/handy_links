from django.contrib import admin
from links.models import CustomUser, Link, Folder

# Register your models here.

admin.site.register(CustomUser)

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'owner', 'created_at']
    search_fields = ['owner', 'public']
    
    
@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ['id', 'url', 'owner', 'folder']
    

