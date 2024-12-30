from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.urls import reverse

# Create your models here.





class CustomUser(AbstractUser):
    avatar = models.URLField("Avatar", max_length=400)
    is_premium = models.BooleanField(default=False)

class Folder(models.Model):
    id = models.UUIDField("Id", primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField('Folder Name', max_length=100)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="Folder_Owner", verbose_name="Owner")
    public = models.BooleanField('Available to everyone?', default=False)
    collaborators = models.ManyToManyField(CustomUser, related_name='collaborated_folders', blank=True, verbose_name='Collaborators List')
    watchers = models.ManyToManyField(CustomUser, related_name='watchers_folders', blank=True, verbose_name='Collaborators Watchers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'

    def __str__(self):
        return f'Folder {self.title} by {self.owner}'

    def get_collaborators(self):
        return list(self.collaborators.values_list('username', flat=True))


    def get_absolute_url(self):
        """Return the absolute URL for the folder."""
        return reverse('folder_detail', kwargs={'pk': self.pk})

    def get_link_qty(self):
        return self.Links.count()



class Link(models.Model):
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='Links', verbose_name='Folder')
    title = models.CharField(max_length=50)
    url = models.TextField('Link Url',max_length=1000)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="Link_Owner", verbose_name="Link Owner")
    description = models.TextField('Link Description', blank=True)

