# Generated by Django 5.1.6 on 2025-03-02 19:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('fantasy', '0009_fantasyleague_end_date_fantasyleague_start_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fantasyteam',
            name='total_stats',
        ),
    ]
