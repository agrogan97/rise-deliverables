# Generated by Django 3.2.13 on 2023-10-05 16:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0022_alter_pointerplayer_rawdata'),
    ]

    operations = [
        migrations.AddField(
            model_name='pointerplayer',
            name='platformData',
            field=models.JSONField(blank=True, null=True),
        ),
    ]