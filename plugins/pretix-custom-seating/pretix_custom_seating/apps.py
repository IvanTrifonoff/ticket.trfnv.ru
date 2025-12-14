from django.apps import AppConfig

class PretixCustomSeatingApp(AppConfig):
    name = 'pretix_custom_seating'
    verbose_name = 'Custom Seating Helper'

    class PretixPluginMeta:
        name = 'Custom Seating Helper'
        author = 'Trfnv'
        description = 'Helper commands and renderer for seating'
        visible = True
        version = '1.0.0'

    def ready(self):
        from . import signals  # Import signals
