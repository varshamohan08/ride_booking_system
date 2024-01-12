from django.contrib.auth.models import User
from django.db import models

class vehicle_type(models.Model):
    type = models.CharField(max_length=50, blank=True)
    fare = models.FloatField()
    cost_per_km = models.FloatField()
    cost_per_min = models.FloatField()
    min_fare = models.FloatField()


class UserDetails(models.Model):
    USER_TYPE_CHOICES = [
        ('Customer', 'Customer'),
        ('Driver', 'Driver'),
        ('Admin', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_details')
    name = models.CharField(max_length=50, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    location = models.TextField()
    available = models.BooleanField(default=False)
    vehicle_type = models.ForeignKey(vehicle_type, on_delete=models.CASCADE, related_name='vehicle_type', null=True, blank=True)

    def __str__(self):
        print(f"Calling __str__ for {self.user.username}'s Details")
        return f"{self.user.username}'s Details"
    
