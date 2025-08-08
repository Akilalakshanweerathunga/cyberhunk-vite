# insights/urls.py
from django.urls import path
from . import views
from .views import analyze_facebook

urlpatterns = [
     path('analyze/', analyze_facebook),
]
