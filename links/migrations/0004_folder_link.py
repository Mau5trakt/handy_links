# Generated by Django 5.1.4 on 2024-12-29 00:03

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('links', '0003_alter_customuser_avatar'),
    ]

    operations = [
        migrations.CreateModel(
            name='Folder',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='Id')),
                ('name', models.CharField(max_length=100, verbose_name='Folder Name')),
                ('public', models.BooleanField(default=False, verbose_name='Available to everyone?')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('collaborators', models.ManyToManyField(blank=True, related_name='collaborated_folders', to=settings.AUTH_USER_MODEL, verbose_name='Collaborators List')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Folder_Owner', to=settings.AUTH_USER_MODEL, verbose_name='Owner')),
                ('watchers', models.ManyToManyField(blank=True, related_name='watchers_folders', to=settings.AUTH_USER_MODEL, verbose_name='Collaborators Watchers')),
            ],
            options={
                'verbose_name': 'Folder',
                'verbose_name_plural': 'Folders',
            },
        ),
        migrations.CreateModel(
            name='Link',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.TextField(max_length=1000, verbose_name='Link Url')),
                ('description', models.TextField(verbose_name='blank')),
                ('folder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Links', to='links.folder', verbose_name='Folder')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Link_Owner', to=settings.AUTH_USER_MODEL, verbose_name='Link Owner')),
            ],
        ),
    ]