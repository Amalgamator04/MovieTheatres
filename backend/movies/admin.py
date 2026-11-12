from django.contrib import admin

from .models import Movie, Seat, Show, Theatre

admin.site.register([Movie, Theatre, Show, Seat])
