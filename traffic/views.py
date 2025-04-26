from django.shortcuts import render
from django.views.generic import  TemplateView


class SuperuserRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        user = request.user
        print(user)
        return super().dispatch(request, *args, **kwargs)
    

class TrafficDashboardView(SuperuserRequiredMixin, TemplateView):

    template_name = "hola.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        return context


        

