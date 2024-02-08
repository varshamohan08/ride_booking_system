from django.contrib import admin
from user_app.models import UserDetails, vehicle_type

# Register your models here.
@admin.register(UserDetails)
class RideStatusAdmin(admin.ModelAdmin):
    list_display = ('user','user_type','location','available')
    search_fields = ('user_type','location','available')

@admin.register(vehicle_type)
class vehicle_type_Admin(admin.ModelAdmin):
    list_display = ('type','fare','cost_per_km','cost_per_min','min_fare')
    search_fields = ('type','fare','cost_per_km','cost_per_min','min_fare')
