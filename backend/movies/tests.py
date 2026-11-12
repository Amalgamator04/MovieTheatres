from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from .models import Movie, Seat, Show, Theatre


class SeedMovieMateTests(TestCase):
    def test_seed_command_is_repeatable(self):
        call_command("seed_moviemate", stdout=StringIO())
        call_command("seed_moviemate", stdout=StringIO())

        self.assertEqual(Movie.objects.count(), 10)
        self.assertEqual(Theatre.objects.count(), 3)
        self.assertEqual(Show.objects.count(), 63)
        self.assertEqual(Seat.objects.count(), 63 * 80)
