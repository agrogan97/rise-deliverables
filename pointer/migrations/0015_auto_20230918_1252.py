# Generated by Django 3.2.13 on 2023-09-18 11:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0014_alter_graphs_options'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Player',
            new_name='PointerPlayer',
        ),
        migrations.AlterModelOptions(
            name='pointerplayer',
            options={'verbose_name': 'Player'},
        ),
    ]
