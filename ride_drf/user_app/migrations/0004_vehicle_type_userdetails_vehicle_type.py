# Generated by Django 5.0.1 on 2024-01-12 12:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_app', '0003_userdetails_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='vehicle_type',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(blank=True, max_length=50)),
                ('fare', models.FloatField()),
                ('cost_per_km', models.FloatField()),
                ('cost_per_min', models.FloatField()),
                ('min_fare', models.FloatField()),
            ],
        ),
        migrations.AddField(
            model_name='userdetails',
            name='vehicle_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='vehicle_type', to='user_app.vehicle_type'),
        ),
    ]