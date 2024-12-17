from django.urls import path
from links import views


urlpatterns = [
    path('', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.MyLoginView.as_view(), name='login'),
    path('home/', views.Home.as_view(), name='home')

]