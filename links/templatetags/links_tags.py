from django import template
from links.models import CustomUser
register = template.Library()

@register.filter
def pluralize_links(count):
    return f'{count} Link' if count == 1 else f'{count} Links'

@register.filter
def get_user_avatar(username):
    '''Given a string with a username, lookup for his avatar url'''
    return CustomUser.objects.get(username=username).get_avatar()


