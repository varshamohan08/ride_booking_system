from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class RideStatus(models.Model):
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    

class Ride(models.Model):
    rider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rides_as_rider')
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rides_as_driver', null=True, blank=True)
    pickup_location = models.TextField()
    dropoff_location = models.TextField()
    amount = models.FloatField(null=True, blank=True)
    status = models.ForeignKey(RideStatus, on_delete=models.CASCADE, related_name='ride_status')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

 