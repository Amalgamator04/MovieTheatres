from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from movies.models import Movie, Seat, Show, Theatre

User = get_user_model()


class BookingAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="riley", password="StrongPass123!")
        self.other_user = User.objects.create_user(username="sam", password="StrongPass123!")
        movie = Movie.objects.create(
            title="Test Movie",
            description="A test movie",
            genre="Drama",
            duration=100,
            rating=8,
            release_date=timezone.localdate(),
        )
        theatre = Theatre.objects.create(name="Test Theatre", location="Central", address="1 Main St")
        self.show = Show.objects.create(
            movie=movie,
            theatre=theatre,
            show_date=timezone.localdate() + timedelta(days=1),
            show_time=timezone.datetime(2000, 1, 1, 18, 0).time(),
            ticket_price=Decimal("15.00"),
        )
        self.seat_one = Seat.objects.create(show=self.show, seat_number="A1", row="A", column=1)
        self.seat_two = Seat.objects.create(show=self.show, seat_number="A2", row="A", column=2)
        self.client.force_authenticate(self.user)

    def test_booking_calculates_total_and_marks_seats_unavailable(self):
        response = self.client.post(
            "/api/bookings/",
            {"show_id": self.show.id, "seat_ids": [self.seat_one.id, self.seat_two.id]},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["total_amount"], "30.00")
        self.assertCountEqual(response.data["seats"], ["A1", "A2"])
        self.seat_one.refresh_from_db()
        self.assertTrue(self.seat_one.is_booked)

        conflict = self.client.post(
            "/api/bookings/",
            {"show_id": self.show.id, "seat_ids": [self.seat_one.id]},
            format="json",
        )
        self.assertEqual(conflict.status_code, 409)

    def test_invalid_or_duplicate_seats_are_rejected(self):
        duplicate = self.client.post(
            "/api/bookings/",
            {"show_id": self.show.id, "seat_ids": [self.seat_one.id, self.seat_one.id]},
            format="json",
        )
        self.assertEqual(duplicate.status_code, 400)

        wrong_show = self.client.post(
            "/api/bookings/",
            {"show_id": self.show.id, "seat_ids": [99999]},
            format="json",
        )
        self.assertEqual(wrong_show.status_code, 400)

    def test_cancel_releases_seats_but_only_for_owner(self):
        created = self.client.post(
            "/api/bookings/",
            {"show_id": self.show.id, "seat_ids": [self.seat_one.id]},
            format="json",
        )
        booking_id = created.data["id"]

        self.client.force_authenticate(self.other_user)
        forbidden = self.client.post(f"/api/bookings/{booking_id}/cancel/")
        self.assertEqual(forbidden.status_code, 404)

        self.client.force_authenticate(self.user)
        cancelled = self.client.post(f"/api/bookings/{booking_id}/cancel/")
        self.assertEqual(cancelled.status_code, 200)
        self.seat_one.refresh_from_db()
        self.assertFalse(self.seat_one.is_booked)
