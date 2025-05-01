from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from links.models import Folder
from django.urls import reverse
from django.shortcuts import redirect

class FolderAccessMixin:
    permission_denied_url = '/not-access'

    def dispatch(self, request, *args, **kwargs):
        folder = get_object_or_404(Folder, id=kwargs.get('uuid'))
        if not self.has_access(request.user, folder):
            raise PermissionDenied('Access denied. You must be a collaborator or watcher to view this folder. Contact the owner for access.')
        return super().dispatch(request, *args, **kwargs)

    def has_access(self, user, folder):
        if folder.owner == user or folder.public or user.username in folder.get_collaborators() or user.username in folder.get_watchers():
            return True
        return False

class SocialRegistrationAuthMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.avatar:
            return redirect(reverse("choose_username"))
        return super().dispatch(request, *args, **kwargs)