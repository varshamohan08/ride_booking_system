# signals.py

from click import Group
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Ride

@receiver(post_save, sender=Ride)
def ride_created(sender, instance, created, **kwargs):
    # import pdb; pdb.set_trace()
    if created:
        Group('ride_notifications').send({'type': 'ride.created', 'ride_id': instance.id})

@receiver(post_save, sender=Ride)
def ride_status_updated(sender, instance, created, **kwargs):
    # import pdb; pdb.set_trace()
    if not created:
        Group('ride_notifications').send({'type': 'ride.status_updated', 'ride_id': instance.id, 'status': instance.status})
