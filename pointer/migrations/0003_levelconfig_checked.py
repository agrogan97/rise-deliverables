# Generated by Django 3.2.13 on 2023-06-20 10:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0002_auto_20230619_1736'),
    ]

    operations = [
        migrations.AddField(
            model_name='levelconfig',
            name='checked',
            field=models.BooleanField(default=False),
        ),
    ]
