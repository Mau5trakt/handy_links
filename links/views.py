import json
from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.views.generic import CreateView, TemplateView, ListView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from links.models import CustomUser, Folder, Link
from links.forms import RegisterForm, FolderCreationForm
from links.avatar_generation import generate_avatar
from django.urls import reverse_lazy
from dal import autocomplete


class FolderAccessMixin:
    permission_denied_url = '/not-access'

    def dispatch(self, request, *args, **kwargs):
        folder = get_object_or_404(Folder, id=kwargs.get('uuid'))
        if not self.has_access(request.user, folder):
            raise PermissionDenied('You dont have access to this folder')
        return super().dispatch(request, *args, **kwargs)

    def has_access(self, user, folder):
        if folder.owner == user or folder.public or user.username in folder.get_collaborators() or user.username in folder.get_watchers():
            return True
        return False



class RegisterUserView(CreateView):
    model = CustomUser
    form_class = RegisterForm
    template_name = 'links/register.html'
    success_url = reverse_lazy('register')

    def get(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect(reverse_lazy('home'))
        return super().get(request, *args, **kwargs)

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.set_password(form.cleaned_data['password'])
        self.object.avatar = generate_avatar()

        self.object.save()

        return super().form_valid(form)


class MyLoginView(LoginView):
    template_name = 'links/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('home')

    def form_invalid(self, form):
        messages.error(self.request, "Username or passsword incorrect")
        return self.render_to_response(self.get_context_data(form=form))


class Home(LoginRequiredMixin, TemplateView):
    template_name = 'links/homepage.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = CustomUser.objects.get(username=self.request.user)
        context['user'] = user
        self.request.session['user_id'] = user.id
        context['personal_folders'] = Folder.objects.filter(owner=self.request.user)[:5]

        return context

def logoutuser(request):
    logout(request)
    return redirect('login')


class UsersAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return CustomUser.objects.none()

        qs = CustomUser.objects.all().exclude(id=self.request.user.id)
        if self.q:
            qs = qs.filter(username__istartswith=self.q)[:5]

        return qs


class FolderCreationView(LoginRequiredMixin, CreateView):
    model = Folder
    form_class = FolderCreationForm
    template_name = 'links/create_folder.html'
    success_url = reverse_lazy('home')


    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.owner = self.request.user
        self.object.save()
        return super().form_valid(form)


class FolderListView(FolderAccessMixin, TemplateView):
    template_name = 'links/folder_list.html'


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        folder = get_object_or_404(Folder, id=kwargs.get('uuid'))
        user = self.request.user

        if folder.owner == user or user.username in folder.get_watchers():
            context["can_add"] = True
            
        context['folder'] = folder
        if self.request.user.is_authenticated:
            context['loged'] = True

        return context


@require_POST
def get_user(request):
    data = json.load(request)
    action = data['action']

    folder = Folder.objects.get(pk=data['folder'])
    user = CustomUser.objects.filter(
        username__iexact=data['username']
    ).order_by("username").first()
    if user:
        if user == request.user:
            return JsonResponse({"status": "failed", "message": f"you're already the owner"})
        elif action == "watcher" and user.username in folder.get_collaborators():
            return JsonResponse({"status": "failed", "message": f"this user is already a collaborator"})
        elif action == "watcher" and user.username not in folder.get_watchers():
            return JsonResponse({"status": "success", "username": user.username})
        elif action == "collaborator" and user.username not in folder.get_collaborators():
            return JsonResponse({"status": "success", "username": user.username})
        return JsonResponse({"status": "failed",  "message": f"this user is already a {action}" })
    return JsonResponse({"status": "failed", "message": "this user doesn't exists"})

@require_POST
def add_user(request):
    data = json.load(request)

    returned_user = data['username']
    folder = Folder.objects.get(pk=data['folder'])
    user = CustomUser.objects.filter(username__iexact=returned_user).first()
    if user and request.user == folder.owner:
        if data['action'] == 'watcher' and user.username in folder.get_watchers():
            return JsonResponse({'status': 'failed', 'message': "This user is already a watcher"})
        elif data['action'] == 'collaborator' and user.username in folder.get_collaborators():
            return JsonResponse({'status': 'failed', 'message': "This user is already a collaborator"})
        elif data['action'] == 'watcher' and user.username not in folder.get_watchers():
            folder.watchers.add(user)
            return JsonResponse({'status': 'success', "username": user.username, "avatar": user.avatar})
        elif data['action'] == 'collaborator' and user.username in folder.get_watchers():
            folder.watchers.remove(user)
            folder.collaborators.add(user)
            folder.save()
            return JsonResponse({'status': 'success', 'changeStatus': True, "username": user.username, "avatar": user.avatar})
        elif data['action'] == 'collaborator' and user.username not in folder.get_collaborators():
            folder.collaborators.add(user)
            return JsonResponse({'status': 'success', "username": user.username, "avatar": user.avatar})
    return JsonResponse({'status': 'failed', 'message': 'There was an error doing this request.'})

@require_POST
def remove_user(request):
    data = json.load(request)
    action = data["action"]
    user = CustomUser.objects.filter(username__iexact=data["username"]).first()
    folder = Folder.objects.get(pk=data["folder"])

    if user:
        if action == "delete-collaborator":
            folder.collaborators.remove(user)    
            return JsonResponse({"status": "success"})
        elif action == "delete-watcher":
            folder.watchers.remove(user)
            return JsonResponse({"status": "success"})
        
    return JsonResponse({"status": "failed", "message": "There was an error removing this user, pleasy try again. "})