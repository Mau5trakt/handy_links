from django.urls import path, re_path
from links import views



urlpatterns = [
    path('', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.MyLoginView.as_view(), name='login'),
    path('home/', views.Home.as_view(), name='home'),
    path('logout/', views.logoutuser, name='logout'),
    re_path(r'^user-autocomplete/$', views.UsersAutocomplete.as_view(), name='user-autocomplete'),
    path('create-folder/', views.FolderCreationView.as_view(), name='create-folder')

]