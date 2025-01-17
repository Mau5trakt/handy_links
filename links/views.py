from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.views.generic import CreateView, TemplateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from links.models import CustomUser, Folder, Link
from links.forms import RegisterForm, FolderCreationForm
from links.avatar_generation import generate_avatar
from django.urls import reverse_lazy
from dal import autocomplete


class RegisterUserView(CreateView):
    model = CustomUser
    form_class = RegisterForm
    template_name = 'links/register.html'
    success_url = reverse_lazy('register')

    def get(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect(reverse_lazy('home'))

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
        print('dale')
        self.object = form.save(commit=False)
        self.object.owner = self.request.user
        self.object.save()
        return super().form_valid(form)



