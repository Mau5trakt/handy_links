from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.urls import reverse
from django.contrib.postgres.indexes import GinIndex

# Create your models here.


class ActiveManager(models.Manager):
    def get_queryset(self):
        return(
            super().get_queryset().filter(status=Folder.Status.ACTIVE)
        )
    


class CustomUser(AbstractUser):
    avatar = models.URLField("Avatar", max_length=400)
    is_premium = models.BooleanField(default=False)


    def get_avatar(self):
        if len(self.avatar) > 0:
            return self.avatar
        return "https://api.dicebear.com/9.x/thumbs/svg?flip=true&rotate=0&backgroundColor=5099D9&translateX=4&eyes=variant7W16&face=variant2&faceOffsetX=10&faceOffsetY=-1&mouth=variant2&shapeColor=1A11A2&radius=50"

class Folder(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'A', 'Active'
        INACTIVE = 'I', 'Inactive'


    id = models.UUIDField("Id", primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField('Folder Name', max_length=100)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="Folder_Owner", verbose_name="Owner")
    public = models.BooleanField('Available to everyone?', default=False)
    collaborators = models.ManyToManyField(CustomUser, related_name='collaborated_folders', blank=True, verbose_name='Collaborators List')
    watchers = models.ManyToManyField(CustomUser, related_name='watchers_folders', blank=True, verbose_name='Watchers List')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=1,choices=Status,default=Status.ACTIVE)
    objects = models.Manager()
    active=ActiveManager()


    class Meta:
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'
        ordering = ['-created_at']
        indexes = [
            GinIndex(
                name="folder_trgm_idx",
                fields=['title'],
                opclasses=["gin_trgm_ops"]
            )
        ]

    def __str__(self):
        return f'Folder {self.title} by {self.owner}'

    def get_collaborators(self):
        return list(self.collaborators.values_list('username', flat=True))

    def get_watchers(self):
        return list(self.watchers.values_list('username', flat=True))


    def get_absolute_url(self):
        """Return the absolute URL for the folder."""
        return reverse('folder_detail', kwargs={'uuid': self.id})

    def show_collaborators(self):
        avatars = [{
            "avatar": self.owner.get_avatar(),
            "username": self.owner.username
        }]

        for c in self.collaborators.all():
            avatars.append({
                "avatar": c.get_avatar(),
                "username": c.username
            })

        return avatars[:3]


    def get_link_qty(self):
        return self.Links.count()



class Link(models.Model):
    class Meta:
        indexes = [
            GinIndex(
                name="url_trgm_idx",
                fields=['url'],
                opclasses=["gin_trgm_ops"]
            )
        ]



    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='Links', verbose_name='Folder')
    title = models.CharField(max_length=50, blank=True)
    url = models.TextField('Link Url',max_length=1000)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="Link_Owner", verbose_name="Link Owner")
    description = models.TextField('Link Description', max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

