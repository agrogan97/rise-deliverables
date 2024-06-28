# Generated by Django 3.2.13 on 2023-08-10 11:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0012_rename_givenid_graphdesign_givenname'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='player',
            name='givenID',
        ),
        migrations.AddField(
            model_name='graphs',
            name='givenName',
            field=models.IntegerField(default=0, unique=True),
            preserve_default=False,
        ),
    ]
