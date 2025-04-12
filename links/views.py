import json
from django.contrib.auth import logout, login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.decorators.http import require_POST
from django.views.generic import CreateView, TemplateView, ListView, RedirectView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required
from links.models import CustomUser, Folder, Link
from links.forms import RegisterForm, FolderCreationForm
from links.avatar_generation import generate_avatar
from links.mixins import SocialRegistrationAuthMixin, FolderAccessMixin
from django.urls import reverse_lazy, reverse
from django.utils import timezone
from braces.views import JsonRequestResponseMixin
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
        Folder.objects.create(
            title=f"{self.object.username}'s folder",
            owner=self.object
        )
        user = authenticate(
            request=self.request,
            username=self.object.username,
            password=form.cleaned_data['password']
        )
        login(self.request, user)

        return super().form_valid(form)


class MyLoginView(LoginView):
    template_name = 'links/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('home')

    def form_invalid(self, form):
        messages.error(self.request, "Username or passsword incorrect")
        return self.render_to_response(self.get_context_data(form=form))

    def form_valid(self, form):
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password')

        try:
            user = CustomUser.objects.get(username__iexact=username)
        except CustomUser.DoesNotExist:
            return self.form_invalid(form)

            # Autenticar con el username real (case-sensitive)
        auth_user = authenticate(
            request=self.request,
            username=user.username,  # Usamos el username exacto de la BD
            password=password
        )

        if auth_user is not None:
            # Si la autenticación es exitosa
            from django.contrib.auth import login
            login(self.request, auth_user)
            return super().form_valid(form)

        return self.form_invalid(form)


class Home(LoginRequiredMixin, SocialRegistrationAuthMixin, TemplateView):
    template_name = 'links/homepage.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = CustomUser.objects.get(username=self.request.user)
        context['user'] = user
        self.request.session['user_id'] = user.id
        context['personal_folders'] = Folder.objects.filter(owner=self.request.user)[:5]
        context['shared_folders'] = Folder.objects.filter(Q(collaborators=user) | Q(watchers=user)).distinct()

        return context

def logoutuser(request):
    logout(request)
    return redirect('login')




class FolderCreationView(LoginRequiredMixin, SocialRegistrationAuthMixin, CreateView):
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
    # Work on the inactive folders

    template_name = 'links/folder_list.html'


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        folder = get_object_or_404(Folder, id=kwargs.get('uuid'))
        user = self.request.user
        
        links = folder.Links.all().order_by('-updated_at')

        if folder.owner == user or user.username in folder.get_collaborators():
            context["can_add"] = True

        if folder.owner == user or user.username in folder.get_collaborators() or user.username in folder.get_watchers():
            context['user_has_settings'] = True
            
        context['folder'] = folder
        context['links'] = links
        if self.request.user.is_authenticated:
            context['loged'] = True

        return context

@login_required
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

@login_required
@require_POST
def lookup_username(request):
    data = json.load(request)
    request_user = data['username']
    if not CustomUser.objects.filter(username__iexact=request_user).exists():
        return JsonResponse({"status": "success", "message": "This username is available"})
    return JsonResponse({"status": "failed", "message": "This username is being used"})

@login_required
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
            return JsonResponse({'status': 'success', "username": user.username, "avatar": user.get_avatar()})
        elif data['action'] == 'collaborator' and user.username in folder.get_watchers():
            folder.watchers.remove(user)
            folder.collaborators.add(user)
            folder.save()
            return JsonResponse({'status': 'success', 'changeStatus': True, "username": user.username, "avatar": user.get_avatar()})
        elif data['action'] == 'collaborator' and user.username not in folder.get_collaborators():
            folder.collaborators.add(user)
            return JsonResponse({'status': 'success', "username": user.username, "avatar": user.get_avatar()})
    return JsonResponse({'status': 'failed', 'message': 'There was an error doing this request.'})

@login_required
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

@login_required
@require_POST
def add_link(request):
    data = json.load(request)
    folder = Folder.objects.get(pk=data["folder"])
    user = CustomUser.objects.get(username=request.user)
    has_description = True if len(data['description'].replace('', '')) > 0 else False
    if folder and user and (user == folder.owner or user.username in folder.get_collaborators()):
        link = Link.objects.create(
           folder=folder,
            url=data['url'],
            owner=user,
            **({'description': data['description']} if has_description else {})
        )

        
        return JsonResponse({
    'status': 'success', 
    'user': {
        'username': request.user.username,
        'avatar': request.user.get_avatar()
    },
    'link': {
        'url': data['url'],
        'id': link.id,
        **({'description': data['description']} if has_description else {})
    },
    'folder': {
        'id': folder.id,
        'linksQty': folder.get_link_qty()
    }
})
    return JsonResponse({'status': 'failed', 'message': 'There was an error submiting yor link'})

@login_required
@require_POST
def edit_link(request):
    data = json.load(request)
    folder = Folder.objects.get(pk=data["folder"])
    user = CustomUser.objects.get(username=request.user)
    link = Link.objects.get(pk=data['link'])

    if folder and user and link and (user in folder.get_collaborators() or user == folder.owner or link.owner == user):
        link.url = data['url']
        link.description = data['description']
        link.save()
        return JsonResponse({'status': "success", "url": data["url"], "description": data["description"]})
    return JsonResponse({'status': 'failed', 'message': 'There was an error modifying this link'})

@login_required
@require_POST
def delete_link(request):
    data = json.load(request)
    folder = Folder.objects.get(pk=data["folder"])
    user = CustomUser.objects.get(username=request.user)
    link = Link.objects.get(pk=data['link'])
    if folder and user and link and (user in folder.get_collaborators() or user == folder.owner or link.owner == user):
        link.delete()
        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "failed", "message": "There was an error deleting this link"})


@login_required
@require_POST
def get_user_folders(request):
    active_folders = Folder.objects.filter(
        Q(status=Folder.Status.ACTIVE) & 
            (Q(owner=request.user) | Q(collaborators=request.user))
    ).distinct()
    folders = []
    for folder in active_folders:
        element = {"id": folder.id, "title": folder.title} 
        folders.append(element)

    return JsonResponse({"status": "success", "folders": folders})


@login_required
@require_POST
def folder_privacy(request):
    data = json.load(request)
    user = request.user
    folder = Folder.objects.get(pk=data["folder"])
    if folder.owner == user:
        folder.public = not folder.public
        folder.save()
        return JsonResponse({"status": "success", "message": "Public" if folder.public else "Private"})
    return JsonResponse({"status": "failed", "message": "There was an error changing the privacity of your folder."})
    



class ChooseUsername(LoginRequiredMixin, TemplateView):
    template_name = "links/choose_username.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

@require_POST
def validate_username(request):
    data = json.load(request)

    return JsonResponse({"status": "success"})


class SetUsername(JsonRequestResponseMixin, View):
    def post(self, request, *args, **kwargs):
        try:
            data = self.request_json
            user = CustomUser.objects.get(username=request.user.username)
            user.username = data['username']
            user.avatar = generate_avatar()
            user.save()

            Folder.objects.create(
                title=f"{data["username"]}'s folder",
                owner = user
            )

            return self.render_json_response({
                'status': 'success'
            })
        except Exception as e:
            return self.render_json_response({
                'status': 'error',
            }, status=400)

