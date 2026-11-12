from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from movies.models import Seat, Show
from .models import Booking, BookingSeat
from .serializers import BookingCreateSerializer, BookingSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        if not isinstance(username, str) or not isinstance(password, str):
            return Response({"detail": "Username and password must be text."}, status=status.HTTP_400_BAD_REQUEST)
        email = request.data.get("email", "")
        if not isinstance(email, str):
            return Response({"email": ["Enter a valid email address."]}, status=status.HTTP_400_BAD_REQUEST)
        username = username.strip()
        email = email.strip()
        if not username or not password:
            return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        if len(username) > 150:
            return Response({"username": ["Ensure this field has no more than 150 characters."]}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username__iexact=username).exists():
            return Response({"username": ["This username is already taken."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(password)
        except DjangoValidationError as error:
            return Response({"password": error.messages}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password, email=email)
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "username": user.username, "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            "show__movie", "show__theatre"
        ).prefetch_related("booking_seats__seat")

    def create(self, request, *args, **kwargs):
        request_serializer = BookingCreateSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        show_id = request_serializer.validated_data["show_id"]
        seat_ids = request_serializer.validated_data["seat_ids"]

        with transaction.atomic():
            try:
                show = Show.objects.select_for_update(of=("self",)).select_related("movie", "theatre").get(
                    pk=show_id, is_active=True
                )
            except Show.DoesNotExist:
                return Response({"detail": "This show is not available."}, status=status.HTTP_404_NOT_FOUND)

            now = timezone.localtime()
            if show.show_date < timezone.localdate() or (
                show.show_date == timezone.localdate() and show.show_time <= now.time()
            ):
                return Response({"detail": "This show has already started."}, status=status.HTTP_400_BAD_REQUEST)

            seats = list(
                Seat.objects.select_for_update().filter(show=show, id__in=seat_ids).order_by("id")
            )
            if len(seats) != len(seat_ids):
                return Response(
                    {"seat_ids": ["One or more seats do not belong to this show."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if any(seat.is_booked for seat in seats):
                return Response(
                    {"seat_ids": ["One or more selected seats are no longer available."]},
                    status=status.HTTP_409_CONFLICT,
                )

            amount = show.ticket_price * Decimal(len(seats))
            booking = Booking.objects.create(user=request.user, show=show, total_amount=amount)
            BookingSeat.objects.bulk_create([BookingSeat(booking=booking, seat=seat) for seat in seats])
            Seat.objects.filter(id__in=[seat.id for seat in seats]).update(is_booked=True)

        return Response(
            BookingSerializer(booking, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            "show__movie", "show__theatre"
        ).prefetch_related("booking_seats__seat")


class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, pk):
        with transaction.atomic():
            try:
                booking = Booking.objects.select_for_update().get(pk=pk, user=request.user)
            except Booking.DoesNotExist:
                return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

            if booking.booking_status == Booking.Status.CANCELLED:
                return Response({"detail": "This booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
            show = booking.show
            now = timezone.localtime()
            if show.show_date < timezone.localdate() or (
                show.show_date == timezone.localdate() and show.show_time <= now.time()
            ):
                return Response({"detail": "This booking can no longer be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

            seat_ids = list(booking.booking_seats.values_list("seat_id", flat=True))
            list(Seat.objects.select_for_update().filter(id__in=seat_ids).order_by("id"))
            Seat.objects.filter(id__in=seat_ids).update(is_booked=False)
            booking.booking_status = Booking.Status.CANCELLED
            booking.save(update_fields=["booking_status"])

        return Response(BookingSerializer(booking).data)
