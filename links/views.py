from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.views.generic import CreateView, TemplateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from links.models import CustomUser, Folder, Link
from links.forms import RegisterForm
from links.avatar_generation import generate_avatar
from django.urls import reverse_lazy


class RegisterUserView(CreateView):
    model = CustomUser
    form_class = RegisterForm
    template_name = 'links/register.html'
    success_url = reverse_lazy('register')

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

        context['personal_folders'] = Folder.objects.filter(owner=self.request.user)[:5]
        print(context['personal_folders'])

        return context

def logoutuser(request):
    logout(request)
    return redirect('login')

