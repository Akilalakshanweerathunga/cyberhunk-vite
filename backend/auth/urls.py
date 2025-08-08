from django.urls import path
from . import views

urlpatterns = [
    path('facebook/', views.facebook_login),
    path('facebook/callback/', views.facebook_callback),
]
