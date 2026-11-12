from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=180)
    description = models.TextField()
    poster = models.URLField(blank=True)
    genre = models.CharField(max_length=120)
    duration = models.PositiveSmallIntegerField(help_text="Runtime in minutes")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    release_date = models.DateField()
    language = models.CharField(max_length=60, default="English")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class Theatre(models.Model):
    name = models.CharField(max_length=160)
    location = models.CharField(max_length=120)
    address = models.CharField(max_length=255)
    total_seats = models.PositiveSmallIntegerField(default=80)

    class Meta:
        ordering = ["location", "name"]

    def __str__(self):
        return f"{self.name} - {self.location}"


class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="shows")
    theatre = models.ForeignKey(Theatre, on_delete=models.CASCADE, related_name="shows")
    show_date = models.DateField()
    show_time = models.TimeField()
    ticket_price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["show_date", "show_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["theatre", "show_date", "show_time"],
                name="unique_theatre_showtime",
            )
        ]

    def __str__(self):
        return f"{self.movie} at {self.theatre} on {self.show_date}"


class Seat(models.Model):
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name="seats")
    seat_number = models.CharField(max_length=8)
    row = models.CharField(max_length=2)
    column = models.PositiveSmallIntegerField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        ordering = ["row", "column"]
        constraints = [
            models.UniqueConstraint(fields=["show", "seat_number"], name="unique_show_seat_number"),
            models.UniqueConstraint(fields=["show", "row", "column"], name="unique_show_seat_position"),
        ]

    def __str__(self):
        return f"{self.show}: {self.seat_number}"
