from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from user_app.models import UserDetails, vehicle_type
from django.core.exceptions import PermissionDenied
from user_app.serializers import UserDetailsSerializer
from django.contrib.auth.models import User
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from datetime import datetime

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_details.user_type == 'Admin'

class IsDriverUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_details.user_type == 'Driver'

class userLogin(APIView):

    def post(self, request):
        try:
            username = request.data.get('username', None)
            password = request.data.get('password', None)
            user = authenticate(username=username, password=password)

            if user is not None:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                user_details = {
                    'username': username,
                    'name': str(user.user_details.first_name).capitalize() + ' ' + str(user.user_details.last_name).capitalize(),
                    'user_type': user.user_details.user_type,
                    'id': user.id,
                }
                return Response({'detail': 'Success', 'access_token': access_token, 'userdetails': user_details}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            return Response({'detail': 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

      
class userLogout(APIView):
    def get(self, request):
        logout(request)
        return Response({'detail': 'Logout successfull'}, status=status.HTTP_200_OK)


class UserDetailsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    
class userApi(APIView):
    permission_classes = [IsAuthenticated]

    # def get_permissions(self):
    #     if self.request.method == 'PATCH':
    #         return [IsDriverUser()]

    def get(self, request):
        try:
            # import pdb;pdb.set_trace()
            user_details = UserDetails.objects.get(user = request.user)
            if user_details.user_type != "Admin":
                raise PermissionDenied("User does not have the privilege")
            
            if request.GET.get('id'):
                user_instance = UserDetails.objects.get(id=request.GET.get('id'))
                user_serializer = UserDetailsSerializer(user_instance)
                return Response({'user': user_serializer.data}, status=status.HTTP_200_OK)
            else:
                user_details_queryset = UserDetails.objects.all()

                paginator = UserDetailsPagination()
                result_page = paginator.paginate_queryset(user_details_queryset, request)

                users_serializer = UserDetailsSerializer(result_page, many=True)

                return paginator.get_paginated_response({'users': users_serializer.data, 'last_page': paginator.page.paginator.num_pages})
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        validated_data = request.data
        user = User.objects.create_user(
            username=request.data.get('username'),
            email=request.data.get('email'),
            password=request.data.get('password')
        )
        if user is not None:

            user_details = UserDetails.objects.create(
                user=user,
                user_type=request.data.get('user_type'),
            )

            return Response({'detail': 'User created successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    def put(self, request):

        current_password = request.data['current_password']
        new_password = request.data['new_password']

        user = request.user
        if user.check_password(current_password):
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Success'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        
    def patch(self, request):
        try:
            user_details = UserDetails.objects.get(user = request.user)
            if user_details.user_type != "Driver":
                raise PermissionDenied("User does not have the privilege")
            
            UserDetails.objects.filter(user=request.user).update(
                available = not UserDetails.objects.get(user=request.user).available
            )
            
            return Response({'detail': "Success"}, status=status.HTTP_200_OK)
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class userProfileApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # import pdb;pdb.set_trace()
            user_instance = UserDetails.objects.get(user=request.user)
            user_serializer = UserDetailsSerializer(user_instance)
            return Response({'user': user_serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        try:
            # import pdb;pdb.set_trace()
            with transaction.atomic():
                user = User.objects.get(id=request.user.id)
                user_details = UserDetails.objects.get(user=user)

                user.username=request.data.get('username')
                user.email=request.data.get('email')
                # user.password=request.data.get('password')
                user.save()
                
                user_details_data = dict(request.data)
                user_details_data['user'] = user.id
                user_details_data['first_name'] = str(request.data.get('first_name')).capitalize()
                user_details_data['last_name'] = str(request.data.get('last_name')).capitalize()

                user_serializer = UserDetailsSerializer(instance=user_details, data=user_details_data)
                
                if user_serializer.is_valid():
                    user_serializer.save()

                    # login(request, user)
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    user_details = {
                        'username': user.username,
                        'name': str(user.user_details.first_name).capitalize() + ' ' + str(user.user_details.last_name).capitalize(),
                        'user_type': user.user_details.user_type,
                    }
                    return Response({'detail': 'Success', 'access_token': access_token, 'userdetails': user_details}, status=status.HTTP_200_OK)
                else:
                    return Response({'detail': user_serializer.errors.values()}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request):
        try:
            # import pdb;pdb.set_trace()
            user = User.objects.get(id=request.user.id)
            user_details = UserDetails.objects.get(user=user)

            user.is_active = False
            user_details.is_active = False

            user.save()
            user_details.save()

            return Response({'detail': "Success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        

class userSignUp(APIView):

    def get(self, request):
        try:
            USER_TYPE_CHOICES = [
                ('Customer', 'Customer'),
                ('Driver', 'Driver'),
                ('Admin', 'Admin'),
            ]
            vehicles = vehicle_type.objects.all()
            return Response({'types': USER_TYPE_CHOICES, 'vehicles': vehicles}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def post(self, request):
        try:
            # import pdb;pdb.set_trace()
            with transaction.atomic():
                user = User.objects.create_user(
                    username=request.data.get('username'),
                    email=request.data.get('email'),
                    password=request.data.get('password')
                )
                user_details_data = dict(request.data)
                user_details_data['user'] = user.id
                user_details_data['first_name'] = str(request.data.get('first_name')).capitalize()
                user_details_data['last_name'] = str(request.data.get('last_name')).capitalize()

                user_serializer = UserDetailsSerializer(data=user_details_data)
                
                if user_serializer.is_valid():
                    user_details = user_serializer.save(user=user)

                    login(request, user)
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    user_details = {
                        'username': user.username,
                        'name': str(user.user_details.first_name).capitalize() + ' ' + str(user.user_details.last_name).capitalize(),
                        'user_type': user.user_details.user_type,
                    }
                    return Response({'detail': 'Success', 'access_token': access_token, 'userdetails': user_details}, status=status.HTTP_200_OK)
                else:
                    return Response({'detail': user_serializer.errors.values()}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

    def put(self, request):
        # import pdb;pdb.set_trace()
        if not request.user:
            existing_user = UserDetails.objects.filter(user__username=request.data.get('username'))
        else:
            existing_user = UserDetails.objects.exclude(user=request.user.id).filter(user__username=request.data.get('username'))
        if existing_user.exists():
            return Response({'detail': "This username is already in use."}, status=status.HTTP_202_ACCEPTED)
        return Response({'detail': "Success"}, status=status.HTTP_200_OK)
    
class UpdateLocation(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        try:
            position = request.data.get('position')
            UserDetails.objects.filter(user=request.user).update(
                location = position,
                updated_by = request.user,
                updated_at = datetime.now()
            )
            return Response({'detail': 'Success'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)