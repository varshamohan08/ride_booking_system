from django.urls import path
from .views import *

urlpatterns = [
    path('user_api', userApi.as_view(), name='user_api'),
    path('share_location', ShareLocation.as_view(), name='share_location'),
    path('login', userLogin.as_view(), name='login'),
    path('logout', userLogout.as_view(), name='logout'),
]