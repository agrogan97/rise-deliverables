# Generated by Django 3.2.13 on 2023-08-09 09:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pointer', '0010_auto_20230809_1004'),
    ]

    operations = [
        migrations.AlterField(
            model_name='graphdesign',
            name='notes',
            field=models.TextField(blank=True, max_length=4096, null=True),
        ),
    ]