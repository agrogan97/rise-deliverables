# Generated by Django 3.2.13 on 2023-06-19 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LevelConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('conceptLevel', models.IntegerField()),
                ('strategyLevel', models.IntegerField()),
                ('targetPath', models.CharField(max_length=128)),
                ('targetConcepts', models.CharField(max_length=128)),
                ('targetIndices', models.CharField(max_length=128)),
                ('distractorPathA', models.CharField(max_length=128)),
                ('distractorConceptsA', models.CharField(max_length=128)),
                ('distractorIndicesA', models.CharField(max_length=128)),
                ('distractorScoreA', models.IntegerField()),
                ('distractorPathB', models.CharField(max_length=128)),
                ('distractorConceptsB', models.CharField(max_length=128)),
                ('distractorIndicesB', models.CharField(max_length=128)),
                ('distractorScoreB', models.IntegerField()),
                ('sideNodes', models.CharField(max_length=128)),
            ],
        ),
    ]
