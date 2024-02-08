from rest_framework import serializers
from user_app.models import UserDetails, vehicle_type
from .models import Ride, RideStatus

class RideStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RideStatus
        fields = ['id', 'status', 'created_at']

class RideSerializer(serializers.ModelSerializer):
    status = RideStatusSerializer() 

    class Meta:
        model = Ride
        fields = ['id', 'rider', 'driver', 'pickup_location', 'dropoff_location', 'amount', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):

        ride = Ride.objects.create(**validated_data)
        return ride

    def update(self, instance, validated_data):
        driver = validated_data.pop('driver', None)
        if driver:
            instance.driver = validated_data.get('driver', None)
        instance.status = RideStatus.objects.filter(status='Accepted').first()
        instance.updated_at = validated_data.get('updated_at', instance.updated_at)
        instance.save()

        return instance
   
class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = vehicle_type
        fields = ['type', 'fare', 'cost_per_km', 'cost_per_min', 'min_fare']