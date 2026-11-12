import uuid

from django.conf import settings
from django.db import models

from movies.models import Seat, Show


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    booking_reference = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    show = models.ForeignKey(Show, on_delete=models.PROTECT, related_name="bookings")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    booking_status = models.CharField(max_length=12, choices=Status.choices, default=Status.CONFIRMED)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = uuid.uuid4().hex.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.booking_reference


class BookingSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="booking_seats")
    seat = models.ForeignKey(Seat, on_delete=models.PROTECT, related_name="booking_seats")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["booking", "seat"], name="unique_booking_seat")
        ]
