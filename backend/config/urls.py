from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token

from bookings.views import RegisterView, LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("movies.urls")),
    path("api/bookings/", include("bookings.urls")),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", obtain_auth_token, name="login"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
]
