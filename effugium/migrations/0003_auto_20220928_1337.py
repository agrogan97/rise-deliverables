# Generated by Django 3.2.13 on 2022-09-28 12:37

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('effugium', '0002_alter_rawleveldata_rawdata'),
    ]

    operations = [
        migrations.AddField(
            model_name='rawleveldata',
            name='lastModified',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='rawleveldata',
            name='timeCreated',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
