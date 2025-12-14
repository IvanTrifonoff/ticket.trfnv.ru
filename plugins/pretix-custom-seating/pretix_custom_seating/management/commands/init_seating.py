from django.core.management.base import BaseCommand
from pretix.base.models import Organizer, Event, SeatingPlan, Item, Quota
from pretix.base.models.seating import SeatCategoryMapping
from pretix.base.services.seating import generate_seats
from django_scopes import scopes_disabled
import json

class Command(BaseCommand):
    help = 'Initialize seating plan and products for the project'

    def handle(self, *args, **options):
        organizer_slug = 't-o'
        event_slug = 'pggnv'
        seating_plan_name = 'Main Hall Plan'
        category_name = 'Standard'
        item_name = 'Standard Seat Ticket'
        quota_name = 'Seating Quota'

        self.stdout.write('Starting seating initialization...')

        with scopes_disabled():
            try:
                org = Organizer.objects.get(slug=organizer_slug)
                event = Event.objects.get(organizer=org, slug=event_slug)
            except Organizer.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'Organizer {organizer_slug} not found.'))
                return
            except Event.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'Event {event_slug} not found.'))
                return

            # 4. Create Item (Ticket) - Moved UP
            item, created = Item.objects.get_or_create(
                event=event,
                name=item_name,
                defaults={
                    'default_price': 1000.00,
                    'active': True,
                    'admission': True
                }
            )

            # 1. Define JSON Layout (Simple 2 rows of 5 seats)
            layout_data = {
                "name": seating_plan_name,
                "categories": [
                    {"name": category_name, "color": "#337ab7"}
                ],
                "zones": [
                    {
                        "name": "Main Zone",
                        "position": {"x": 0, "y": 0},
                        "rows": []
                    }
                ],
                "size": {"width": 600, "height": 400}
            }

            # Generate seats programmatically
            for r in range(1, 3): # 2 rows
                row_seats = []
                for s in range(1, 6): # 5 seats per row
                    row_seats.append({
                        "seat_number": str(s),
                        "position": {
                            "x": (s-1) * 40,
                            "y": (r-1) * 50
                        },
                        "category": category_name,
                        "seat_guid": f"{r}-{s}",
                        "item_id": item.id
                    })
                layout_data['zones'][0]['rows'].append({
                    "row_number": str(r),
                    "seats": row_seats,
                    "position": {"x": 0, "y": (r-1)*50}
                })

            # 2. Create or Update Seating Plan
            plan, created = SeatingPlan.objects.get_or_create(
                organizer=org,
                name=seating_plan_name,
                defaults={'layout_data': layout_data}
            )
            
            # Always update layout data
            plan.layout_data = layout_data
            plan.save()
            self.stdout.write(f'Updated SeatingPlan: {plan.name} with new data')

            # 3. Link Plan to Event
            if event.seating_plan != plan:
                event.seating_plan = plan
                event.save()
                self.stdout.write(self.style.SUCCESS(f'Linked plan to event {event.name}'))

            # 5. Map Item to Seating Category
            mapping_obj, created = SeatCategoryMapping.objects.get_or_create(
                event=event,
                layout_category=category_name,
                defaults={'product': item}
            )
            if mapping_obj.product != item:
                mapping_obj.product = item
                mapping_obj.save()
            
            self.stdout.write(f'Mapped category {category_name} to item {item.name}')

            # 6. Create Quota
            quota, created = Quota.objects.get_or_create(
                event=event,
                name=quota_name,
                defaults={
                    'size': None,
                    'release_after_exit': False,
                }
            )
            if item not in quota.items.all():
                quota.items.add(item)
            
            # 7. GENERATE SEATS in Database
            self.stdout.write('Generating Seat objects in database...')
            mapping_dict = {category_name: item}
            generate_seats(event, None, plan, mapping_dict)
            self.stdout.write(self.style.SUCCESS(f'Generated/Updated Seat objects for event {event.name}'))
            
            self.stdout.write(self.style.SUCCESS('Seating initialization completed successfully!'))
