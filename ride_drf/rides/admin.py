from django.contrib import admin
from .models import RideStatus, Ride

# Register your models here.

@admin.register(RideStatus)
class RideStatusAdmin(admin.ModelAdmin):
    list_display = ('status', 'created_at')
    search_fields = ('status',)

@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ('rider', 'driver', 'pickup_location', 'dropoff_location', 'status', 'created_at', 'updated_at')
    search_fields = ('rider__username', 'driver__username', 'pickup_location', 'dropoff_location')
    list_filter = ('status',)
