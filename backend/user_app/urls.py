from django.urls import path
from .views import *

urlpatterns = [
    path('user_api', userApi.as_view(), name='user_api'),
    path('profile_api', userProfileApi.as_view(), name='profile_api'),
    path('login', userLogin.as_view(), name='login'),
    path('logout', userLogout.as_view(), name='logout'),

    path('sign_up', userSignUp.as_view(), name='sign_up'),
    path('update_location', UpdateLocation.as_view(), name='update_location'),
]