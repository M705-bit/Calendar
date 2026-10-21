# Birthday Calendar

A full-stack web application for tracking your friends' birthdays. Built with a **FastAPI** backend, **SQLite** database, and a pixel-art styled frontend using vanilla JavaScript.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Backend](#backend)
  - [Database](#database)
  - [Frontend](#frontend)
  - [JavaScript Logic](#javascript-logic)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Known Issues / Limitations](#known-issues--limitations)

---

## Overview

Birthday Calendar is a personal web app that lets you register your friends' names and birthdays, then visualizes them on an interactive monthly calendar. Days with a birthday are highlighted in red, today is highlighted in purple, and the app always shows you who has the next upcoming birthday.

---

## Features

- Interactive monthly calendar with previous/next navigation
- Today's date highlighted automatically
- Weekends visually differentiated from weekdays
- Birthday days marked in red on the calendar grid
- "Next birthday" display — always shows the closest upcoming birthday
- Add a friend's birthday via an in-calendar form (no page reload)
- Data persisted in a local SQLite database
- Pixel-art aesthetic with responsive layout for mobile and desktop

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3.12, FastAPI, Uvicorn       |
| Database   | SQLite (via Python `sqlite3`)        |
| Validation | Pydantic v2                         |
| Templates  | Jinja2 (server-side HTML rendering) |
| Frontend   | HTML5, CSS3, Vanilla JavaScript     |
| Fonts      | Google Fonts — Pixelify Sans, Press Start 2P |

---

## Project Structure

```
Calendar/
├── app/
│   ├── main.py             # FastAPI application and all route definitions
│   ├── database.py         # DB connection helper and schema initialization
│   ├── modelos.py          # Pydantic request body model (friendCreate)
│   ├── teste.py            # Dev script to manually query the database
│   ├── requirements.txt    # Python dependencies for the app package
│   ├── static/
│   │   ├── css/
│   │   │   └── styles2.css # All app styles (pixel theme, calendar grid, responsive)
│   │   └── js/
│   │       └── calendario.js # All frontend logic (rendering, API calls, events)
│   └── templates/
│       └── index2.html     # Single-page HTML template served by FastAPI
├── requirements.txt        # Root-level dependency list (same packages)
└── .gitignore
```

---

## How It Works

### Backend

`main.py` creates a FastAPI app with four routes:

- **`GET /`** — serves the HTML page via a Jinja2 template.
- **`GET /friends`** — queries the SQLite database and returns all friends as a JSON array.
- **`GET /nextbirthday`** — same as `/friends`; the next-birthday calculation is handled in the frontend.
- **`POST /add_friends/`** — accepts a JSON body, checks for duplicate names, and inserts a new row. Returns a 400 error if the friend already exists.

The app initializes the database table on startup via the `@app.on_event("startup")` hook.

### Database

`database.py` manages a local SQLite file (`birthday_database.db`) with a single table:

```sql
CREATE TABLE IF NOT EXISTS friend (
    name     TEXT PRIMARY KEY,
    birthday TEXT NOT NULL   -- stored as YYYY-MM-DD
);
```

`name` is the primary key, so duplicate names are rejected at the DB level in addition to the application-level check.

### Frontend

`index2.html` defines the page structure:

- A **header** with the app title and subtitle.
- A **navigation bar** with previous/next month buttons and the current month name.
- A **display panel** that shows:
  - An "Add Birthday" button (top)
  - The next upcoming birthday (bottom)
  - A hidden form that appears when "Add Birthday" is clicked
- A **day-names row** (Sun – Sat).
- A **calendar grid** built dynamically by JavaScript.
- A **footer** showing the current month/year, day count, weekday count, and weekend count.

### JavaScript Logic

`calendario.js` handles everything on the client side. Key functions:

| Function | What it does |
|---|---|
| `renderCalendar()` | Builds the full grid of day cells for the current month. Marks today, weekends, and calls `addBirthdayToCalandar()` after render. |
| `addBirthdayToCalandar()` | Fetches `/friends`, finds which days in the current month have a birthday, and adds the `.birthday` CSS class (red highlight) to matching cells. |
| `nextBirthday()` | Fetches `/friends`, calculates each friend's next occurrence of their birthday (this year or next), sorts them, and displays the nearest one in the display panel. |
| `mostrarFormulario()` | Shows the add-birthday form and hides the "Add Birthday" button and birthday display. |
| `esconderFormulario()` | Hides the form and restores the button and birthday display. |
| `form.addEventListener('submit', ...)` | Intercepts the form submit, sends a `POST /add_friends/` fetch request with `{ name, birthday }` as JSON, shows success or error alerts, then re-renders birthdays. |
| `prevMonth / nextMonth` click handlers | Update `currentDate`, update the month label, and re-render the calendar. |

**CSS visual states:**

| Class | Appearance |
|---|---|
| `.today` | Purple background + dark purple ring |
| `.weekend` | Pink background + pink border |
| `.birthday` | Red background + dark border, slightly scaled up |
| `.birthday.weekend` | Red overrides the weekend pink |
| `.empty` | Transparent, no border (padding cells before/after the month) |

---

## API Reference

### `GET /friends`

Returns all friends stored in the database.

**Response:**
```json
[
  { "name": "Ana", "birthday": "1995-07-15" },
  { "name": "João", "birthday": "1990-11-03" }
]
```

---

### `POST /add_friends/`

Adds a new friend and their birthday.

**Request body:**
```json
{
  "name": "Ana",
  "birthday": "1995-07-15"
}
```

**Success response (200):**
```json
{ "message": "Amigo adicionado com sucesso!" }
```

**Error response (400) — duplicate name:**
```json
{ "detail": "Amigo com esse nome já existe." }
```

---

## Getting Started

### Prerequisites

- Python 3.10+

### 1. Clone the repository

```bash
git clone <repository-url>
cd Calendar
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the development server

```bash
cd app
uvicorn main:app --reload
```

Open your browser at `http://127.0.0.1:8000`.

### 5. (Optional) Inspect the database directly

```bash
cd app
python teste.py
```

This prints all rows currently stored in the `friend` table.

---

## Known Issues / Limitations

- **Duplicate names only** — two friends with the same name cannot be stored, even if their birthdays differ.
- **Birthday day offset** — there is a known `+1` offset in `addBirthdayToCalandar()` (`const day = birthday.getDate() + 1`) to compensate for how SQLite stores dates vs. how JavaScript parses them. This may cause incorrect highlighting in edge cases (e.g. the 1st of a month).
- **No delete or edit** — there is currently no UI or endpoint to remove or update a birthday.
- **Single page** — all friends across all months are fetched on every calendar render; performance will degrade with a very large number of entries.
