# Generated by Django 3.2.13 on 2023-09-20 15:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0015_auto_20230918_1252'),
    ]

    operations = [
        migrations.DeleteModel(
            name='LevelConfig',
        ),
        migrations.RenameField(
            model_name='graphdesign',
            old_name='conceptLevel',
            new_name='level',
        ),
        migrations.RenameField(
            model_name='graphs',
            old_name='conceptLevel',
            new_name='level',
        ),
        migrations.RemoveField(
            model_name='graphdesign',
            name='distractorA',
        ),
        migrations.RemoveField(
            model_name='graphdesign',
            name='distractorB',
        ),
        migrations.RemoveField(
            model_name='graphdesign',
            name='end',
        ),
        migrations.RemoveField(
            model_name='graphdesign',
            name='start',
        ),
        migrations.RemoveField(
            model_name='graphdesign',
            name='strategyLevel',
        ),
        migrations.RemoveField(
            model_name='graphdesign',
            name='target',
        ),
        migrations.RemoveField(
            model_name='graphdesign',
            name='targetScore',
        ),
        migrations.RemoveField(
            model_name='graphs',
            name='distractorA',
        ),
        migrations.RemoveField(
            model_name='graphs',
            name='distractorB',
        ),
        migrations.RemoveField(
            model_name='graphs',
            name='end',
        ),
        migrations.RemoveField(
            model_name='graphs',
            name='start',
        ),
        migrations.RemoveField(
            model_name='graphs',
            name='strategyLevel',
        ),
        migrations.RemoveField(
            model_name='graphs',
            name='target',
        ),
        migrations.AddField(
            model_name='graphdesign',
            name='nodes',
            field=models.CharField(default='', max_length=512),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='graphs',
            name='nodes',
            field=models.CharField(default='', max_length=512),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='graphdesign',
            name='givenName',
            field=models.CharField(max_length=64, unique=True),
        ),
        migrations.AlterField(
            model_name='graphs',
            name='givenName',
            field=models.CharField(max_length=64, unique=True),
        ),
    ]