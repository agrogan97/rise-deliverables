# Generated by Django 3.2.13 on 2023-10-01 18:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0018_auto_20231001_1914'),
    ]

    operations = [
        migrations.AlterField(
            model_name='graphs',
            name='nodes',
            field=models.CharField(max_length=4096),
        ),
        migrations.AlterField(
            model_name='graphs',
            name='scores',
            field=models.CharField(max_length=4096),
        ),
    ]