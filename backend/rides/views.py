from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rides.serializers import RideSerializer
from user_app.models import UserDetails, vehicle_type
from user_app.serializers import UserDetailsSerializer
from .models import Ride, RideStatus
from django.core.exceptions import PermissionDenied

from geopy.distance import geodesic
from datetime import datetime
from ast import literal_eval
from rest_framework.pagination import PageNumberPagination

def calculate_distance_time(point1, point2, speed_kmph=20):
    
    distance = geodesic(point1, point2).kilometers

    time_hours = distance / speed_kmph

    time_seconds = int(time_hours * 60 * 60)

    hours, remainder = divmod(time_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    return distance, hours, minutes, seconds

{
    "pickup_location" : {"latitude" : 9.581331590728096, "longitude" : 76.63346969672654},
    "dropoff_location" : {"latitude" : 10.301818563381353, "longitude" : 76.3329825120758}
}

class requestRide(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # import pdb;pdb.set_trace()
            pickup_location = request.data.get('pickup_location')
            dropoff_location = request.data.get('dropoff_location')
            drivers = UserDetails.objects.filter(user_type = 'Driver', available = True).values()
            vehicle_types = vehicle_type.objects.values()

            vehicle_dict = {}
            
            point1 = (pickup_location['lat'], pickup_location['lon'])
            point2 = (dropoff_location['lat'], dropoff_location['lon'])
            dropoff_distance, dropoff_hours, dropoff_minutes, dropoff_seconds = calculate_distance_time(point1, point2)

            dropoff_time_taken = f"{dropoff_hours}h {dropoff_minutes}min {dropoff_seconds}sec"

            dropoff_total_minutes = dropoff_hours * 60 + dropoff_minutes + dropoff_seconds / 60

            for each_vehicle_type in vehicle_types:

                user_instance = UserDetails.objects.filter(user_type = 'Driver', vehicle_type_id = each_vehicle_type["id"], available = True)
                drivers = UserDetailsSerializer(user_instance, many=True)

                for each_driver in drivers.data:

                    location_dict = each_driver['location']
                    if(type(location_dict) != dict):
                        location_dict = literal_eval(location_dict)
                    

                    point3 = (location_dict['latitude'], location_dict['longitude'])

                    distance, hours, minutes, seconds = calculate_distance_time(point3, point1)

                    time_taken = f"{hours}h {minutes}min {seconds}sec"

                    total_minutes = hours * 60 + minutes + seconds / 60

                    if each_vehicle_type['id'] in vehicle_dict.keys() and vehicle_dict[each_vehicle_type['id']]['distance'] > distance:

                        amount = round(each_vehicle_type['fare'] + (each_vehicle_type['cost_per_km'] * dropoff_distance) + (each_vehicle_type['cost_per_km'] * distance) + (each_vehicle_type['cost_per_min'] * total_minutes + (each_vehicle_type['cost_per_min'] * dropoff_total_minutes)))
                        if amount < each_vehicle_type['min_fare']:
                            amount = each_vehicle_type['min_fare']

                        vehicle_dict[each_vehicle_type['id']] = {
                            'distance': distance, 
                            'distance_km': str(distance) + 'km', 
                            'time' : time_taken,
                            'type' : each_vehicle_type['type'],
                            'driver' : each_driver['user'],
                            'amount' :amount,
                            'location' : location_dict
                        }
                        
                    else:

                        amount = round(each_vehicle_type['fare'] + (each_vehicle_type['cost_per_km'] * dropoff_distance) + (each_vehicle_type['cost_per_km'] * distance) + (each_vehicle_type['cost_per_min'] * total_minutes + (each_vehicle_type['cost_per_min'] * dropoff_total_minutes)))
                        if amount < each_vehicle_type['min_fare']:
                            amount = each_vehicle_type['min_fare']

                        vehicle_dict[each_vehicle_type['id']] = {
                            'distance': distance, 
                            'distance_km': str(distance) + 'km', 
                            'time' : time_taken,
                            'type' : each_vehicle_type['type'],
                            'driver' : each_driver['user'],
                            'amount' :amount,
                            'location' : location_dict
                        }

            return Response({"detail": "Success", "rides": vehicle_dict.values()}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)


class RidesPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class rideAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            if request.GET.get('id'):
                ride_instance = Ride.objects.get(id=request.GET.get('id'))
                if request.GET.get('action') and request.GET.get('action')=='location':
                    driver_instance = UserDetails.objects.get(user = ride_instance.driver)
                    return Response({'detail': 'Success', 'location': driver_instance.location}, status=status.HTTP_200_OK)
                    
                ride_serializer = RideSerializer(ride_instance)
                return Response({'detail': 'Success', 'ride': ride_serializer.data}, status=status.HTTP_200_OK)
            else:
                user_details = UserDetails.objects.get(user=request.user)
                if user_details.user_type == 'Admin':
                    rides = Ride.objects.all().order_by('-created_at')
                if user_details.user_type == 'Driver':
                    rides = Ride.objects.filter(driver=request.user).order_by('-created_at')
                if user_details.user_type == 'Customer':
                    rides = Ride.objects.filter(rider=request.user).order_by('-created_at')
                if not rides.exists():
                    return Response({"message": "No data"}, status=status.HTTP_204_NO_CONTENT)
                

                paginator = RidesPagination()
                result_page = paginator.paginate_queryset(rides, request)

                serializer = RideSerializer(result_page, many=True)
                # import pdb;pdb.set_trace()
                # for item in serializer.data:
                #     print(item)

                return paginator.get_paginated_response({'rides': serializer.data, 'last_page': paginator.page.paginator.num_pages})

            # serializer = RideSerializer(ride, many=False)
            # return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        
    def post(self, request):
        try:
            # import pdb;pdb.set_trace()
            validate_data = request.data
            validate_data['rider'] = request.user.id
            validate_data['pickup_location'] = str(validate_data['pickup_location'])
            validate_data['dropoff_location'] = str(validate_data['dropoff_location'])
            status_instance = RideStatus.objects.get(status='Requested')
            driver_id = request.data.get('driver_id')
            if status_instance:
                validate_data['status'] = status_instance
                ride_serializer = RideSerializer(data=validate_data)
                if ride_serializer.is_valid():
                    ride_serializer.save(rider_id = request.user.id, status_id = status_instance.id, driver_id = driver_id)
                    return Response({'detail': 'Success'}, status=status.HTTP_200_OK)
                else:
                    return Response({'detail': ride_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'detail': 'Invalid status ID'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)

    
    def put(self, request):
        try:
            if request.data.get('id'):
                user_details = UserDetails.objects.get(user=request.user)
                ride = Ride.objects.get(id = request.data.get('id'))
                if ride.driver != request.user and ride.rider != request.user:
                    raise PermissionDenied("User does not have the privilege")
                if request.data.get('status') == 'Accept' and ride.status.status == "Requested":
                    ride.status = RideStatus.objects.get(status = "Accepted")
                elif request.data.get('status') == 'Start' and ride.status.status == "Accepted":
                    ride.status = RideStatus.objects.get(status = "Started")
                elif request.data.get('status') == 'Completed' and ride.status.status == "Started":
                    ride.status = RideStatus.objects.get(status = "Completed")
                elif request.data.get('status') == 'Cancel' and ride.status.status == "Requested":
                    ride.status = RideStatus.objects.get(status = "Cancelled")
                else:
                    raise Exception("Invalid status transition")
                ride.save()
                return Response({'detail': 'Success'}, status=status.HTTP_200_OK)
            return Response({'detail': 'Invalid ID'}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

