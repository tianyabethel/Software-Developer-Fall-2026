# Software Developer Internship — IDX Exchange

This repository contains software development projects for the IDX Exchange internship, including a Node.js and Express backend for searching property listings and retrieving open-house information.

## Technology Stack

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- Backend tests are located in `backend/tests/`.

## Backend Features

The backend is located in `backend/` and provides the following endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Checks API and database connectivity |
| GET | `/api/properties` | Searches property listings with optional filters and pagination |
| GET | `/api/properties/:id` | Retrieves a property by listing ID |
| GET | `/api/properties/:id/openhouses` | Retrieves open houses associated with a listing |

### Property Search Filters

The property search endpoint supports these query parameters:

- `city`
- `zipcode`
- `minPrice`
- `maxPrice`
- `beds`
- `baths`
- `limit` — defaults to 20; maximum 100
- `offset` — defaults to 0

Example:

```text
GET /api/properties?city=Irvine&minPrice=500000&beds=3&limit=10
```

## Project Structure

```text
backend/
├── db.js
├── package.json
├── package-lock.json
├── server.js
├── routes/
│   └── properties.js
└── tests/
    └── properties.test.js
```

The repository also contains weekly internship deliverables, supporting scripts, and project documentation.

## Setup

1. Install a compatible version of Node.js.
2. Open a terminal and navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create `backend/.env` and configure these database variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
5. Start the development server:

   ```bash
   npm run dev
   ```

The server uses port `5000` by default unless `PORT` is configured.

## Testing

Backend test files are located in `backend/tests/`. Check the configured test scripts and dependencies before running the tests.

## Notes

Do not commit credentials or secrets from `.env` files.
