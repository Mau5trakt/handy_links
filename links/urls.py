from django.urls import path, re_path
from links import views



urlpatterns = [
    path('', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.MyLoginView.as_view(), name='login'),
    path('home/', views.Home.as_view(), name='home'),
    path('logout/', views.logoutuser, name='logout'),
    re_path(r'^user-autocomplete/$', views.UsersAutocomplete.as_view(), name='user-autocomplete'),
    path('create-folder/', views.FolderCreationView.as_view(), name='create-folder'),
    path('folder-detail/<uuid:uuid>', views.FolderListView.as_view(), name='folder_detail'),
    path('get-user', views.get_user, name="get_user"),
    path('add-user', views.add_user, name='add_user'),
    path('remove-user', views.remove_user, name='remove_user'),
    path('add-link', views.add_link, name='add_link'),
    path('edit-link', views.edit_link, name='edit_link'),
    path('delete-link', views.delete_link, name='delete_link'),
    path('get-user-folders', views.get_user_folders, name='get_folders'),
    path('folder-privacity', views.folder_privacity, name="folder_privacity")
]