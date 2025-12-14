from django.apps import AppConfig

class PretixCustomSeatingApp(AppConfig):
    name = 'pretix_custom_seating'
    verbose_name = 'Custom Seating Helper'

    class PretixPluginMeta:
        name = 'Custom Seating Helper'
        author = 'Trfnv'
        description = 'Helper commands for seating'
        visible = True
        version = '1.0.0'

default_app_config = 'pretix_custom_seating.PretixCustomSeatingApp'
