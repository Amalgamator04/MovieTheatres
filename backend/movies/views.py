from django.utils import timezone
from django.db.models import Q
from rest_framework import filters, generics
from rest_framework.permissions import AllowAny

from .models import Movie, Seat, Show, Theatre
from .serializers import MovieSerializer, SeatSerializer, ShowSerializer, TheatreSerializer


def upcoming_shows():
    today = timezone.localdate()
    now = timezone.localtime().time()
    return Show.objects.filter(is_active=True).filter(
        Q(show_date__gt=today) | Q(show_date=today, show_time__gt=now)
    ).select_related("movie", "theatre")


class MovieListView(generics.ListAPIView):
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]
    queryset = Movie.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "genre", "language"]


class MovieDetailView(generics.RetrieveAPIView):
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]
    queryset = Movie.objects.filter(is_active=True)


class MovieSearchView(MovieListView):
    pass


class TheatreListView(generics.ListAPIView):
    serializer_class = TheatreSerializer
    permission_classes = [AllowAny]
    queryset = Theatre.objects.all()


class ShowListView(generics.ListAPIView):
    serializer_class = ShowSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = upcoming_shows()
        movie_id = self.request.query_params.get("movie")
        location = self.request.query_params.get("location")
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        if location:
            queryset = queryset.filter(theatre__location__icontains=location)
        return queryset


class ShowDetailView(generics.RetrieveAPIView):
    serializer_class = ShowSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return upcoming_shows()

class ShowSeatsView(generics.ListAPIView):
    serializer_class = SeatSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Seat.objects.filter(show_id=self.kwargs["pk"]).order_by("row", "column")
