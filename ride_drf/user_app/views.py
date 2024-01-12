from django.shortcuts import redirect, render
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.contrib.auth import logout
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from user_app.models import UserDetails
from django.core.exceptions import PermissionDenied

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_details.user_type == 'Admin'

# Create your views here.
class userLogin(APIView):
    
    def post(self,request):

        username = request.data.get('username', None)
        password = request.data.get('password', None)

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({'access_token': access_token}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    def put(self, request):
        validated_data = request.data
        user = User.objects.create_user(
            username=request.data.get('username'),
            email=request.data.get('email'),
            password=request.data.get('password')
        )
        if user is not None:

            user_details = UserDetails.objects.create(
                user=user,
                user_type='Customer',
                name=request.data.get('name')
                # location=request.data.get('location'),
                # available=request.data.get('available', True)
            )

            login(request, user)

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({'access_token': access_token}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

      
class userLogout(APIView):
    def get(self, request):
        logout(request)
        return redirect('/login')
            
class userApi(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
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
            return Response({'detail': 'Password updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
class ShareLocation(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request):
        try:
            user_details = UserDetails.objects.get(user = request.user)
            if user_details.user_type != "Driver":
                raise PermissionDenied("User does not have the privilege")
            msg = ''
            if request.data.get('available'):
                UserDetails.objects.filter(user=request.user).update(
                    location=str(request.data.get('location')),
                    available=True
                )
                msg = "Status updated to Available"
            else:
                UserDetails.objects.filter(user=request.user).update(
                    available=False
                )
                msg = "Status updated to Not Available"
            return Response({'detail': msg}, status=status.HTTP_200_OK)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)