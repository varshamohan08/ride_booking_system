from django.urls import path
from .views import *

urlpatterns = [
    path('request_ride', requestRide.as_view(), name='request_ride'),
    path('ride_api', rideAPI.as_view(), name='ride_api'),
]