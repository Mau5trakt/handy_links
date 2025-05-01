from django.urls import path

from . import views  # Import your views from the current app

app_name = 'traffic'  # Set the app name for namespacing

urlpatterns = [
    path('', views.TrafficDashboardView.as_view(), name='dashboard'),  # Example route for the home page
    
]