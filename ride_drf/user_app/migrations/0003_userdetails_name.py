# Generated by Django 5.0.1 on 2024-01-11 20:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_app', '0002_alter_userdetails_available'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdetails',
            name='name',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]