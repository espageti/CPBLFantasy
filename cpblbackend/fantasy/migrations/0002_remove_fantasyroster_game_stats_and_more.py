# Generated by Django 5.1.6 on 2025-02-26 19:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fantasy', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fantasyroster',
            name='game_stats',
        ),
        migrations.AlterField(
            model_name='player',
            name='position',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
