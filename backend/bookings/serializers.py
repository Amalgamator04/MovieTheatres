from rest_framework import serializers

from .models import Booking
from movies.serializers import ShowSerializer


class BookingSerializer(serializers.ModelSerializer):
    show = ShowSerializer(read_only=True)
    seats = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ["id", "booking_reference", "show", "seats", "total_amount", "booking_status", "created_at"]

    def get_seats(self, booking):
        return [
            booking_seat.seat.seat_number
            for booking_seat in booking.booking_seats.select_related("seat").order_by("seat__row", "seat__column")
        ]


class BookingCreateSerializer(serializers.Serializer):
    show_id = serializers.IntegerField(min_value=1)
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), min_length=1, max_length=10
    )

    def validate_seat_ids(self, value):
        if len(set(value)) != len(value):
            raise serializers.ValidationError("A seat can only be selected once.")
        return value
