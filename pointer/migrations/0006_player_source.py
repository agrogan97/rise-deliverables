# Generated by Django 3.2.13 on 2023-08-08 09:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0005_player'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='Source',
            field=models.CharField(default='test', max_length=64),
            preserve_default=False,
        ),
    ]