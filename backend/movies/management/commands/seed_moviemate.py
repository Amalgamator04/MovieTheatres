from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from movies.models import Movie, Seat, Show, Theatre


MOVIES = [
    ("Cloudberry Summer", "A young illustrator returns to her island home and discovers the magic in starting over.", "Romance", 112, 8.2, "English"),
    ("The Last Astronaut", "A quiet mission beyond the solar system becomes a journey into the unknown.", "Sci-Fi", 128, 8.6, "English"),
    ("Midnight at Marigold", "A neighbourhood cafe brings together a group of strangers on one unforgettable night.", "Drama", 105, 7.9, "English"),
    ("Paws of Thunder", "A fearless rescue dog sets out on an adventure bigger than the city.", "Family", 98, 8.1, "English"),
    ("Monsoon Melody", "Two musicians find a shared rhythm during a rain-soaked season in Mumbai.", "Romance", 121, 8.0, "Hindi"),
    ("The Clockwork Garden", "A curious inventor discovers a secret world growing beneath the old city.", "Fantasy", 114, 7.8, "English"),
    ("One More Heist", "A retired crew reunites for one final, delightfully complicated caper.", "Comedy", 109, 7.6, "English"),
    ("Blue Hour", "A coastal detective follows a trail of clues that begins with an empty lighthouse.", "Thriller", 117, 8.3, "English"),
    ("Little Big League", "An underdog school team discovers that the best victories happen together.", "Family", 101, 7.7, "English"),
    ("Paper Planets", "A young scientist and her grandfather build a model of their impossible dreams.", "Adventure", 107, 8.4, "English"),
]

THEATRES = [
    ("Starlight Cinema", "Downtown", "18 Rose Avenue, Downtown"),
    ("Moonbeam Picture House", "Riverside", "42 River Walk, Riverside"),
    ("The Velvet Screen", "Midtown", "7 Lavender Lane, Midtown"),
]


class Command(BaseCommand):
    help = "Create sample movies, theatres, future shows, and seats."

    def handle(self, *args, **options):
        today = timezone.localdate()
        movies = []
        for index, (title, description, genre, duration, rating, language) in enumerate(MOVIES):
            movie, _ = Movie.objects.update_or_create(
                title=title,
                defaults={
                    "description": description,
                    "poster": f"https://images.unsplash.com/photo-{[
                        '1489599849927-2ee91cede3ba', '1440404653325-ab127d49abc1',
                        '1517604931442-7e0c8ed2963c', '1478720568477-152d9b164e26',
                        '1485846234645-a62644f84728', '1500530855697-b586d89ba3ee',
                        '1480111719846-2a7f8eecb63f', '1489599849927-2ee91cede3ba',
                        '1505685296765-3a2736de412f', '1478720568477-152d9b164e26'
                    ][index]}?auto=format&fit=crop&w=800&q=85",
                    "genre": genre,
                    "duration": duration,
                    "rating": rating,
                    "release_date": today - timedelta(days=30 + index),
                    "language": language,
                    "is_active": True,
                },
            )
            movies.append(movie)

        theatres = []
        for name, location, address in THEATRES:
            theatre, _ = Theatre.objects.update_or_create(
                name=name,
                defaults={"location": location, "address": address, "total_seats": 80},
            )
            theatres.append(theatre)

        times = [(12, 30), (16, 0), (20, 0)]
        for day_offset in range(1, 8):
            show_date = today + timedelta(days=day_offset)
            for theatre_index, theatre in enumerate(theatres):
                for time_index, (hour, minute) in enumerate(times):
                    movie = movies[(day_offset + theatre_index + time_index) % len(movies)]
                    show, _ = Show.objects.update_or_create(
                        theatre=theatre,
                        show_date=show_date,
                        show_time=timezone.datetime(2000, 1, 1, hour, minute).time(),
                        defaults={
                            "movie": movie,
                            "ticket_price": Decimal("12.50") + Decimal(theatre_index * 2),
                            "is_active": True,
                        },
                    )
                    Seat.objects.bulk_create(
                        [
                            Seat(
                                show=show,
                                seat_number=f"{chr(ord('A') + row_index)}{column}",
                                row=chr(ord("A") + row_index),
                                column=column,
                            )
                            for row_index in range(8)
                            for column in range(1, 11)
                        ],
                        ignore_conflicts=True,
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(movies)} movies, {len(theatres)} theatres, future shows, and seats."
        ))
