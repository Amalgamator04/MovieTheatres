from rest_framework import serializers

from .models import Movie, Seat, Show, Theatre


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            "id", "title", "description", "poster", "genre", "duration",
            "rating", "release_date", "language",
        ]


class TheatreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theatre
        fields = ["id", "name", "location", "address", "total_seats"]


class ShowSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    theatre = TheatreSerializer(read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Show
        fields = ["id", "movie", "theatre", "show_date", "show_time", "ticket_price", "available_seats"]

    def get_available_seats(self, show):
        return show.seats.filter(is_booked=False).count()


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ["id", "seat_number", "row", "column", "is_booked"]
