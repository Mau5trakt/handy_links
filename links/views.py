from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.shortcuts import render, redirect, get_object_or_404
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

        print(self.request.user)
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

        context['folder'] = folder
        if self.request.user.is_authenticated:
            context['loged'] = True

        return context



