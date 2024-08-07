# Generated by Django 3.2.13 on 2023-11-09 16:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('effugium', '0013_auto_20231017_1522'),
    ]

    operations = [
        migrations.CreateModel(
            name='Config4D',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('layoutId', models.CharField(max_length=64, unique=True)),
                ('layout', models.CharField(max_length=2048)),
                ('timeCreated', models.DateTimeField(auto_now_add=True)),
                ('lastModified', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Config4D',
                'verbose_name_plural': 'Configs4D',
            },
        ),
        migrations.AddField(
            model_name='playerdata',
            name='playMode',
            field=models.CharField(default='3D', max_length=16),
        ),
    ]
