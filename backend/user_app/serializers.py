from rest_framework import serializers
from user_app.models import UserDetails
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class UserDetailsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserDetails
        fields = ['id', 'user', 'first_name', 'last_name', 'email', 'mobile', 'user_type', 'location', 'available', 'vehicle_type']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if type(instance.location) == str:
            representation['location'] = eval(instance.location)
        return representation

    def validate_email(self, value):

        existing_user = UserDetails.objects.filter(email=value).exclude(user=self.instance.user if self.instance else None).first()
        if existing_user:
            raise serializers.ValidationError("This email address is already in use.")

        return value

    def validate_mobile(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Mobile number must contain only digits.")
        
        existing_user = UserDetails.objects.filter(mobile=value).exclude(user=self.instance.user if self.instance else None).first()
        if existing_user:
            raise serializers.ValidationError("This mobile number is already in use.")
        
        return value
    
class AllUserDetailsSerializer(serializers.ModelSerializer):
    user_details = UserDetailsSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'user_details']