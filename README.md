<<<<<<< HEAD
# Smart-expense-tracker
=======
# Expense Tracker

A simple full-stack expense tracker built with React (Vite) for the frontend and Express for the backend. Add, edit, delete, filter, and export expenses. Data is stored on-disk at `server/data/expenses.json` so it persists between restarts.

**Live Demo:**https://smart-expense-tracker-1-brxe.onrender.com/
**GitHub:** https://github.com/AMyyush/Smart-expense-tracker.git

---

## Highlights

- Add, edit, and delete expenses
- Set monthly income and view remaining balance
- Per-category breakdown and monthly summary endpoints
- Export expenses to Excel (`xlsx`)
- Persistent JSON storage at `server/data/expenses.json`
- Vite-powered React frontend with charts (Recharts)

---

## Tech Stack

- **Frontend:** React, Vite, Recharts, Axios
- **Backend:** Node.js, Express
- **Storage:** JSON file in `server/data/expenses.json`
- **Export:** xlsx (SheetJS)

---

## Project Structure

```
expense-tracker/
├── client/                 # Vite + React app
│   ├── public/
│   └── src/
│       ├── components/     # UI components (ExpenseForm, ExpenseList, Filters, Summary, etc.)
│       ├── services/       # API wrapper (api.js)
│       └── main.jsx
├── server/                 # Express API
│   ├── data/               # persisted JSON (`expenses.json`)
│   └── index.js
└── README.md
```

---

## Quick Start (local)

- Backend

```powershell
cd server
npm install
npm run dev   # requires nodemon (dev) or use `npm start` to run once
```

The server listens on `http://localhost:5000` (see [server/index.js](server/index.js)).

- Frontend

```powershell
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default (Vite). For local development ensure the frontend calls the backend at `http://localhost:5000` — update the base URL in [client/src/services/api.js](client/src/services/api.js) if necessary.

---

## Available Scripts

- Frontend (`client/package.json`): `dev`, `build`, `preview`, `lint` (Vite + ESLint)
- Backend (`server/package.json`): `dev` (nodemon) and `start` (node)

---

## API Endpoints

- `GET /expenses` — return all expenses (sorted newest first)
- `POST /expenses` — create an expense; body: `{ amount, category, date, note }`
- `PUT /expenses/:id` — update an expense
- `DELETE /expenses/:id` — delete an expense
- `GET /expenses/summary` — summary stats (total this month, per category, highest expense, monthly income, remaining)
- `POST /income` — set monthly income; body: `{ income }`

See the server implementation at [server/index.js](server/index.js) for validations and exact responses.

---

## Data Persistence

Expenses and the configured `monthlyIncome` are saved to `server/data/expenses.json`. This means data persists across server restarts without a separate database.

---

## Notes & Next Steps

- Consider switching to a database (SQLite / MongoDB) for multi-user support.
- Add user authentication if you want private user data.
- Add file-upload support for receipts and a calendar view for better UX.

---

## Author

Ayush Mittal
Built as part of Studio Graphene Associate Software Engineer Assignment
>>>>>>> d50d201 (Initial commit)
