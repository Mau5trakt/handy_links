# Generated by Django 5.1.4 on 2024-12-16 22:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('links', '0002_rename_premium_customuser_is_premium'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar',
            field=models.URLField(max_length=400, verbose_name='Avatar'),
        ),
    ]