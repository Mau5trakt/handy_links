from django.urls import reverse
from .models import RouteCount, RouteLog

class RequestLogginMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        self._track_route(request.path, request)
        return response

    def _track_route(self, route_path, request):
        RouteCount.increment_count(route_path)








