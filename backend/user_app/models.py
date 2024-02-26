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
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(null= True, blank= True)
    mobile = models.CharField(max_length=15, unique= True, null=True, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    location = models.TextField(null= True, blank= True)
    available = models.BooleanField(default=False)
    vehicle_type = models.ForeignKey(vehicle_type, on_delete=models.CASCADE, related_name='vehicle_type', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING,null= True, blank= True, related_name='updated_by')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # print(f"Calling __str__ for {self.user.username}'s Details")
        return f"{self.user.username}'s Details"
    
