from django.test import TestCase, RequestFactory
from .signals import render_custom_seating
import json

class SeatingRendererTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_render_seating_output(self):
        # Create Dummy Request
        request = self.factory.get('/')
        
        # Mock Event and Seating Plan
        class MockPlan:
            layout_data = json.dumps({
                "size": {"width": 100, "height": 100},
                "zones": []
            })
            
        class MockEvent:
            seating_plan = MockPlan()
            
        request.event = MockEvent()
        
        # Execute
        html = render_custom_seating(None, request)
        
        # Verify
        self.assertIn('<svg id="seating-svg"', html)
        self.assertIn('Select your seat', html)
