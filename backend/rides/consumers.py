from channels.generic.websocket import WebsocketConsumer
import json

from rides.serializers import RideSerializer
from .models import Ride
import logging
from channels.layers import get_channel_layer
from datetime import datetime

logger = logging.getLogger(__name__)
# import pdb;pdb.set_trace()
class RideConsumer(WebsocketConsumer):
    def connect(self):
        # import pdb;pdb.set_trace()
        logger.info(f"User ID: {self.scope['query_string'].decode().split('=')[-1]}")
        self.accept()
        query_params = self.scope['query_string'].decode()
        self.user_id = query_params.split('=')[-1]
        # user_id = query_params.split('=')[-1]
        logger.info(f"User ID: {self.user_id}")
        if self.user_id:
            self.group_name = f'ride_notifications_{self.user_id}'
            self.channel_layer = get_channel_layer()
            self.channel_layer.group_add(self.group_name, self.channel_name)
            # Fetch initial rides for the user
            self.fetch_rides({})
        else:
            self.close()

    def disconnect(self, close_code):
        # import pdb;pdb.set_trace()
        pass

    def receive(self, text_data=None, bytes_data=None):
        # import pdb;pdb.set_trace()
        if text_data:
            data = json.loads(text_data)
            if data['type'] == 'subscribe':
                # Subscribe to ride notifications for the specific user
                self.group_name = f'ride_notifications_{self.user_id}'
                self.channel_layer.group_add(self.group_name, self.channel_name)
                # Fetch initial rides for the user
                self.fetch_rides({})

    def fetch_rides(self, event):
        # import pdb;pdb.set_trace()
        rides = Ride.objects.all()
        serialized_rides = []
        for ride in rides:
            serialized_ride = {
                'id': ride.id,
                'status': ride.status.status,
                'pickup': ride.pickup_location,
                'dropoff': ride.dropoff_location,
                'created_at': datetime.strftime(ride.created_at, '%d-%b-%Y')
            }
            serialized_rides.append(serialized_ride)

        self.send(text_data=json.dumps({
            'type': 'fetch_rides',
            'rides': serialized_rides
        }))

    def notify_new_ride(self, event):
        # import pdb;pdb.set_trace()
        self.send(text_data=json.dumps({
            'type': 'new_ride',
            'ride_id': event['ride_id']
        }))

    def notify_status_update(self, event):
        # import pdb;pdb.set_trace()
        self.send(text_data=json.dumps({
            'type': 'status_update',
            'ride_id': event['ride_id'],
            'status': event['status']
        }))

    def ride_created(self, event):
        # import pdb;pdb.set_trace()
        ride = Ride.objects.get(id=event['ride_id'])
        if self.user_id in [ride.driver.id, ride.rider.id]:
            self.notify_new_ride(event)

    def ride_status_updated(self, event):
        # import pdb;pdb.set_trace()
        ride = Ride.objects.get(id=event['ride_id'])
        if self.user_id in [ride.driver.id, ride.rider.id]:
            self.notify_status_update(event)
