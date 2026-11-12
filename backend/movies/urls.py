from django.urls import path

from .views import (
    MovieDetailView,
    MovieListView,
    MovieSearchView,
    ShowDetailView,
    ShowListView,
    ShowSeatsView,
    TheatreListView,
)

urlpatterns = [
    path("movies/", MovieListView.as_view(), name="movie-list"),
    path("movies/search/", MovieSearchView.as_view(), name="movie-search"),
    path("movies/<int:pk>/", MovieDetailView.as_view(), name="movie-detail"),
    path("theatres/", TheatreListView.as_view(), name="theatre-list"),
    path("shows/", ShowListView.as_view(), name="show-list"),
    path("shows/<int:pk>/", ShowDetailView.as_view(), name="show-detail"),
    path("shows/<int:pk>/seats/", ShowSeatsView.as_view(), name="show-seats"),
]
