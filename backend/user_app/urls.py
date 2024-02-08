from django.urls import path
from .views import *

urlpatterns = [
    path('user_api', userApi.as_view(), name='user_api'),
    path('profile_api', userProfileApi.as_view(), name='profile_api'),
    # path('update_availability', UpdateAvailability.as_view(), name='update_availability'),
    path('login', userLogin.as_view(), name='login'),
    path('logout', userLogout.as_view(), name='logout'),

    path('sign_up', userSignUp.as_view(), name='sign_up'),
]