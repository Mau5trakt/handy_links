from django.urls import reverse
from django.views.generic import  TemplateView
from django.http import Http404
from traffic.models import RouteLog, RouteCount

class SuperuserRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            raise Http404()
        return super().dispatch(request, *args, **kwargs)
    

class TrafficDashboardView(SuperuserRequiredMixin, TemplateView):

    template_name = "traffic/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        counts = RouteCount.objects.all().order_by('-count')[:50]
        logs = RouteLog.objects.all()[:50]
        context['counts'] = counts
        context['detail_route'] = reverse('traffic:dashboard')
        context['logs'] =logs

        return context




        

