# Generated by Django 3.2.13 on 2023-10-03 11:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0019_auto_20231001_1915'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pointerplayer',
            name='RawData',
            field=models.CharField(blank=True, max_length=65536, null=True),
        ),
    ]
