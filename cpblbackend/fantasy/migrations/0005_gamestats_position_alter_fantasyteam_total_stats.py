# Generated by Django 5.1.6 on 2025-02-28 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fantasy', '0004_alter_fantasyteam_total_stats'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamestats',
            name='position',
            field=models.CharField(blank=True),
        ),
        migrations.AlterField(
            model_name='fantasyteam',
            name='total_stats',
            field=models.JSONField(default=[]),
        ),
    ]
