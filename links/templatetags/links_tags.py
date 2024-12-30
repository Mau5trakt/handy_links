from django import template

register = template.Library()

@register.filter
def pluralize_links(count):
    return f'{count} Link' if count == 1 else f'{count} Links'