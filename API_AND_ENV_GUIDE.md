# MovieMate API and Environment Guide

This is the reference for where the frontend connects to the backend, which API routes are available, and where each environment variable belongs.

## 1. API base URLs

The frontend creates its shared Axios client in `frontend/src/services/api.js`. All pages and authentication code import this client instead of setting their own API URL.

| Environment | `VITE_API_URL` |
|---|---|
| Local development | `http://127.0.0.1:8000/api` |
| Deployed backend | `https://movietheatres.onrender.com/api` |

Set this variable in `frontend/.env` for local development. For a deployed frontend, configure `VITE_API_URL` in the frontend host's environment settings and rebuild/redeploy the frontend. Vite embeds `VITE_` variables during the build; changing the variable after a build does not update the existing bundle.

The frontend pages that make API calls are:

| Frontend file | Requests made |
|---|---|
| `frontend/src/services/api.js` | Shared Axios base URL, JSON header, and token header |
| `frontend/src/context/AuthContext.jsx` | Register, login, logout |
| `frontend/src/pages/HomePage.jsx` | List and search movies |
| `frontend/src/pages/MovieDetailPage.jsx` | Movie details and shows |
| `frontend/src/pages/SeatSelectionPage.jsx` | Show details, show seats, create booking |
| `frontend/src/pages/BookingsPage.jsx` | List and cancel bookings |
| `frontend/src/pages/BookingConfirmationPage.jsx` | Retrieve booking details |

## 2. API endpoints

All paths below are relative to the API base URL. For example, local movies are at `http://127.0.0.1:8000/api/movies/`.

### Movies, theatres, shows

| Method | Path | Authentication | Purpose / query parameters |
|---|---|---|---|
| GET | `/movies/` | No | List active movies. Supports `?search=<text>` (title, genre, language). |
| GET | `/movies/search/?search=<text>` | No | Search active movies. |
| GET | `/movies/{id}/` | No | Get an active movie. |
| GET | `/theatres/` | No | List theatres. |
| GET | `/shows/` | No | List upcoming active shows. Optional `?movie={id}` and `?location=<text>` filters. |
| GET | `/shows/{id}/` | No | Get an upcoming active show. |
| GET | `/shows/{id}/seats/` | No | List seats and their availability for a show. |

Movie responses contain `id`, `title`, `description`, `poster`, `genre`, `duration`, `rating`, `release_date`, and `language`. Show responses include nested movie and theatre objects, `show_date`, `show_time`, `ticket_price`, and `available_seats`. Seat responses include `id`, `seat_number`, `row`, `column`, and `is_booked`.

List responses use Django REST Framework pagination and normally have this shape:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": []
}
```

### Authentication

| Method | Path | Request body | Purpose |
|---|---|---|---|
| POST | `/auth/register/` | `{"username":"riley","email":"riley@example.com","password":"..."}` | Create an account and return a token. Email is optional. |
| POST | `/auth/login/` | `{"username":"riley","password":"..."}` | Return a token for an existing account. |
| POST | `/auth/logout/` | Empty | Revoke the current token. Requires authentication. |

Successful registration and login return a token. The frontend stores it in browser local storage and the Axios client sends it with protected requests:

```http
Authorization: Token <token>
```

### Bookings

Every booking endpoint requires the token header above. Users can only list, retrieve, or cancel their own bookings.

| Method | Path | Purpose |
|---|---|---|
| POST | `/bookings/` | Create a booking. |
| GET | `/bookings/` | List the signed-in user's bookings. |
| GET | `/bookings/{id}/` | Retrieve one of the user's bookings. |
| POST | `/bookings/{id}/cancel/` | Cancel an owned booking before showtime and release its seats. |

Create a booking with show and seat IDs from the API:

```json
{
  "show_id": 12,
  "seat_ids": [81, 82]
}
```

The backend validates that the show is upcoming and active, verifies seats belong to that show and remain available, limits a booking to 10 seats, locks the rows in a transaction, and calculates the total from the show price. Do not send a price or availability value; those are not accepted from the frontend.

### Common responses

| Status | Meaning |
|---|---|
| `200 OK` | Successful read, login, or cancellation. |
| `201 Created` | Registration or booking succeeded. |
| `204 No Content` | Logout succeeded; the response body is empty. |
| `400 Bad Request` | Invalid fields, duplicate seat IDs, past show, or cancellation not allowed. |
| `401 Unauthorized` | Missing/invalid token for a protected endpoint. |
| `404 Not Found` | Resource not found, inactive/expired show, or booking not owned by the current user. |
| `409 Conflict` | One or more seats were booked by someone else before this booking completed. Refresh seat availability and choose again. |

## 3. Where environment variables go

There are separate environment files for Django and Vite:

- `backend/.env` configures the Django process and database.
- `frontend/.env` configures the Vite frontend build.
- `.env.example` files are templates. Copy them to `.env`, then fill in your own values.
- On Render, set the variables in each service's **Environment** settings. Do not upload `.env` files or put database credentials in frontend variables.

### Backend variables (`backend/.env` or Render backend service)

| Variable | Used for | Local example / guidance |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django signing and security | Generate a private random secret. Never commit or publish it. |
| `DJANGO_DEBUG` | Django debug mode | `True` locally; `False` on Render/production. |
| `DJANGO_ALLOWED_HOSTS` | Hostnames Django accepts for incoming requests | Local: `127.0.0.1,localhost`. Render: your backend hostname, e.g. `movietheatres.onrender.com` (host only, no scheme or path). |
| `DATABASE_URL` | PostgreSQL connection URL, if set it takes precedence over the `DB_*` values | On Render, use the database URL available to the backend service. Keep it private. |
| `DB_NAME` | Local PostgreSQL database name when `DATABASE_URL` is unset | e.g. `moviemate` |
| `DB_USER` | Local PostgreSQL username | Your local database user |
| `DB_PASSWORD` | Local PostgreSQL password | Your local database password; never commit it. |
| `DB_HOST` | Local PostgreSQL host | Usually `127.0.0.1` locally. |
| `DB_PORT` | Local PostgreSQL port | Usually `5432`. |
| `CORS_ALLOWED_ORIGINS` | Browser frontend origins allowed to call the backend | Comma-separated origins only; e.g. `http://localhost:5173,http://127.0.0.1:5173`. Add the deployed frontend origin when you have one. |
| `CSRF_TRUSTED_ORIGINS` | Origins Django trusts for CSRF-protected requests (such as admin forms) | Comma-separated full origins including `https://` when applicable. This is separate from CORS. |

`DATABASE_URL` is used when present; otherwise Django builds its PostgreSQL connection from `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT`. For Render, use the database URL accessible from the backend service. Render's internal database host generally is not resolvable from your local Windows computer; use the database's external connection URL for local access, if enabled.

`CORS_ALLOWED_ORIGINS` must contain the frontend's origin, not the backend URL and not an `/api` path. If there is no browser frontend yet, no frontend origin needs to be added. For local Vite development allow `http://localhost:5173` and/or `http://127.0.0.1:5173`.

### Frontend variable (`frontend/.env` or frontend hosting service)

| Variable | Used for | Example |
|---|---|---|
| `VITE_API_URL` | API base URL read by `frontend/src/services/api.js` | Local: `http://127.0.0.1:8000/api`; deployed: `https://movietheatres.onrender.com/api` |

Only public configuration such as the API base URL belongs in frontend environment variables. Never put `DATABASE_URL`, database passwords, Django secrets, or admin credentials in `frontend/.env` or any `VITE_` variable.

## 4. Local setup and deployment checklist

### Local backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Set a local Django secret and PostgreSQL connection values.
3. Activate the backend virtual environment, then run `python manage.py migrate`.
4. Start Django with `python manage.py runserver` (or use Waitress on Windows).

### Local frontend calling the deployed backend

Set `frontend/.env` to:

```env
VITE_API_URL=https://movietheatres.onrender.com/api
```

The deployed backend's `CORS_ALLOWED_ORIGINS` must then allow the exact origin of the local frontend, for example `http://127.0.0.1:5173`. Restart the Vite server after editing `.env`.

### Deploying both services

1. Set backend secrets, database URL, allowed host, and CORS origins in the **backend** hosting service.
2. Set `VITE_API_URL=https://movietheatres.onrender.com/api` in the **frontend** service's build environment.
3. Set the backend `CORS_ALLOWED_ORIGINS` to the frontend's deployed origin (scheme and host only).
4. Redeploy both services after changing environment variables. Rebuild the frontend after changing `VITE_API_URL`.
5. Keep `.env` files, API tokens, passwords, and secret keys out of Git and screenshots.

## 5. Admin and API locations

- Deployed API root: `https://movietheatres.onrender.com/api/`
- Example deployed movie list: `https://movietheatres.onrender.com/api/movies/`
- Local API root: `http://127.0.0.1:8000/api/`
- Django admin is at `/admin/` on the backend host; it is not part of the `/api/` prefix.
