from django.urls import path, re_path
from links import views



urlpatterns = [
    path('', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.MyLoginView.as_view(), name='login'),
    path('home/', views.Home.as_view(), name='home'),
    path('logout/', views.logoutuser, name='logout'),
    path('create-folder/', views.FolderCreationView.as_view(), name='create-folder'),
    path('folder-detail/<uuid:uuid>', views.FolderListView.as_view(), name='folder_detail'),
    path('get-user', views.get_user, name="get_user"),
    path('add-user', views.add_user, name='add_user'),
    path('remove-user', views.remove_user, name='remove_user'),
    path('add-link', views.add_link, name='add_link'),
    path('edit-link', views.edit_link, name='edit_link'),
    path('delete-link', views.delete_link, name='delete_link'),
    path('get-user-folders', views.get_user_folders, name='get_folders'),
    path('folder-privacy', views.folder_privacy, name="folder_privacy"),
    path('choose-username/', views.ChooseUsername.as_view(), name='choose_username'),
    path('lookup-username', views.lookup_username, name='lookup_username'),
    path('set-username', views.SetUsername.as_view(), name='set_username'),
    path('search', views.SearchView.as_view(), name='search'),
    path('folders', views.AllUserFolders.as_view(), name='get_folders'),
    path("search-form", views.SearchRedirectView.as_view(), name="search_form"),
    path('404', views.NotFoundHandler.as_view(), kwargs={"exception": Exception("aver")}),
    #path('landing', views.LandingView.as_view(), name='landing')

]