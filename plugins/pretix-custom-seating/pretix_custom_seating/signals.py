from django.dispatch import receiver
from pretix.presale.signals import render_seating_plan
from django.template.loader import get_template

@receiver(render_seating_plan, dispatch_uid="pretix_custom_seating_render")
def render_custom_seating(sender, request, **kwargs):
    if not hasattr(request, 'event') or not request.event.seating_plan:
        return ""
    
    template = get_template('pretix_custom_seating/plan.html')
    ctx = {
        'plan': request.event.seating_plan,
        'layout_json': request.event.seating_plan.layout_data 
    }
    return template.render(ctx)
