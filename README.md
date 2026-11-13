# MovieMate

MovieMate is a responsive movie-ticket booking app built with React and Django REST Framework. It includes a playful claymorphism-inspired interface, token authentication, theatre/show listings, live seat availability, and server-validated bookings.

For a quick reference to API routes, frontend API calls, and local/Render environment variables, see [API_AND_ENV_GUIDE.md](./API_AND_ENV_GUIDE.md).

## Technology

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React
- **Backend:** Python, Django, Django REST Framework, Django CORS Headers, token authentication
- **Database:** PostgreSQL

## Project structure

```text
backend/
  config/                 Django settings and URL routing
  movies/                 Movie, theatre, show, and seat APIs and models
  bookings/               Booking APIs, transaction logic, and tests
  manage.py
  requirements.txt
frontend/
  src/components/         Shared UI components
  src/context/            Authentication context
  src/pages/               Application pages
  src/services/            Axios API client
  src/App.jsx
  src/main.jsx
```

## Prerequisites

- Python 3.10+
- Node.js 20+ and npm
- PostgreSQL 14+ with a local database and user

## PostgreSQL and environment

Create a PostgreSQL database and user, for example in `psql`:

```sql
CREATE DATABASE moviemate;
CREATE USER moviemate_user WITH PASSWORD 'choose-a-local-password';
GRANT ALL PRIVILEGES ON DATABASE moviemate TO moviemate_user;
```

On PostgreSQL 15+, also grant schema access after connecting to the new database:

```sql
GRANT ALL ON SCHEMA public TO moviemate_user;
```

In PowerShell, create the backend environment file and edit it with your local PostgreSQL values:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` in `backend\.env`. Replace `DJANGO_SECRET_KEY` with a random secret before sharing or deploying the app. The example CORS origins permit the local Vite development server only.

Create the frontend environment file:

```powershell
cd ..\frontend
Copy-Item .env.example .env
```

`VITE_API_URL` defaults to `http://127.0.0.1:8000/api`.

## Run the backend

Open a PowerShell terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env to match your local PostgreSQL configuration.
python manage.py makemigrations movies bookings
python manage.py migrate
python manage.py seed_moviemate
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`. To access Django admin, create an administrator with `python manage.py createsuperuser`.

### Run the WSGI server on Windows

Gunicorn requires POSIX modules such as `fcntl` and cannot run natively on Windows. The requirements install Waitress on Windows and Gunicorn on Linux. For a Windows WSGI run, collect Django's admin static files and start Waitress from `backend`:

```powershell
python manage.py collectstatic --noinput
waitress-serve --listen=127.0.0.1:8000 config.wsgi:application
```

Open `http://127.0.0.1:8000/admin/` for the Django admin. For Linux deployments, use `gunicorn config.wsgi:application --bind 0.0.0.0:8000` and configure the host, database, and secret environment variables for that deployment.

## Run the frontend

In a second PowerShell terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL, normally `http://127.0.0.1:5173`.

## User flow

1. Browse, search, or filter movies on the home page.
2. Select an upcoming theatre showtime.
3. Register or log in when prompted.
4. Choose up to 10 available seats and confirm. The backend locks the show/seats inside a database transaction, checks availability, and calculates the amount.
5. View or print the digital ticket under My Bookings. A booking can be cancelled before the showtime; seats are then released.

## API endpoints

All routes are prefixed with `/api/`. Booking endpoints require the header `Authorization: Token <token>`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/movies/` | List active movies; supports `?search=` |
| GET | `/movies/search/?search=<query>` | Search movie title, genre, or language |
| GET | `/movies/{id}/` | Movie details |
| GET | `/theatres/` | List theatres |
| GET | `/shows/?movie={id}&location={name}` | List upcoming active shows (filters optional) |
| GET | `/shows/{id}/` | Show details |
| GET | `/shows/{id}/seats/` | Show all seats and their availability |
| POST | `/auth/register/` | Register `{ "username", "email", "password" }`; returns token |
| POST | `/auth/login/` | Obtain a token with `{ "username", "password" }` |
| POST | `/auth/logout/` | Revoke the current token |
| GET | `/bookings/` | List the authenticated user's bookings |
| POST | `/bookings/` | Book `{ "show_id", "seat_ids": [1, 2] }` |
| GET | `/bookings/{id}/` | Retrieve an owned booking |
| POST | `/bookings/{id}/cancel/` | Cancel an owned future booking |

Booking creation returns `409 Conflict` if a seat was taken, `400 Bad Request` for invalid seat/show selections, and `201 Created` with the unique booking reference on success. The backend never accepts a client-provided price or availability value.

## Tests

With the backend virtual environment active and a reachable PostgreSQL database configured:

```powershell
cd backend
python manage.py test bookings
```

The booking API tests cover server-side totals, occupied/invalid seat rejection, cancellation and seat release, and user ownership.

Build the frontend production bundle:

```powershell
cd frontend
npm run build
```

## Local development notes

- Token auth is used as requested. The frontend stores the token in browser local storage; use HTTPS, a strong secret key, and a production-grade authentication/session strategy before deploying to the public internet.
- The seed command is safe to rerun and creates 10 movies, three theatres, a week of upcoming shows, and 80 seats per show.
- Cancellation is allowed only before the scheduled showtime. There are no refunds/payment processing in this local sample app.
