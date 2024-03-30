from rest_framework import serializers
from user_app.models import UserDetails, vehicle_type
from user_app.serializers import AllUserDetailsSerializer
from .models import Ride, RideStatus

class RideStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RideStatus
        fields = ['id', 'status', 'created_at']

class RideSerializer(serializers.ModelSerializer):
    status = RideStatusSerializer(read_only=True) 
    rider = AllUserDetailsSerializer(read_only=True)
    driver = AllUserDetailsSerializer(read_only=True)

    class Meta:
        model = Ride
        fields = ['id', 'rider', 'driver', 'pickup_location', 'dropoff_location', 'amount', 'status', 'created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['pickup_location'] = instance.pickup_location
        representation['dropoff_location'] = instance.dropoff_location
        if type(representation['pickup_location'] != dict):
            representation['pickup_location'] = eval(representation['pickup_location'])
        if type(representation['dropoff_location'] != dict):
            representation['dropoff_location'] = eval(representation['dropoff_location'])
        if instance.driver:
            representation['driver_vehicle_type'] = instance.driver.user_details.vehicle_type.type
        if instance.status:
            representation['color'] = 'transparent'
            if instance.status.status.lower() == 'requested':
                representation['color'] = 'lightblue'
            if instance.status.status.lower() == 'accepted':
                representation['color'] = 'green'
            if instance.status.status.lower() == 'started':
                representation['color'] = 'orange'
            if instance.status.status.lower() == 'completed':
                representation['color'] = 'blue'
            if instance.status.status.lower() == 'cancelled':
                representation['color'] = 'red'
        return representation

    def create(self, validated_data):
        # import pdb;pdb.set_trace()
        # validated_data['status'] = RideStatus.objects.get(id = validated_data['status']['id'])
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