# Generated by Django 5.1.6 on 2025-03-01 09:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fantasy', '0007_alter_fantasyteam_total_stats'),
    ]

    operations = [
        migrations.AddField(
            model_name='fantasyroster',
            name='position',
            field=models.CharField(default='P'),
            preserve_default=False,
        ),
    ]
