# User CRUD app

React and Vite provide the user management screen. The Express API follows MVC: route definitions live in `server/routes`, request handling and validation in `server/controllers`, and Prisma database access in `server/models`. PostgreSQL is the database; Prisma defines and migrates its schema.

## Set up

1. Get a PostgreSQL URL using the steps below, or use a PostgreSQL database you already have.
2. Install packages: `npm install`.
3. Put your connection string in `.env` as `DATABASE_URL`.
4. Apply the schema: `npm run db:migrate -- --name create_user`.
5. Start the API: `npm run dev:api`.
6. In a second terminal, start the frontend: `npm run dev`.

## Get a temporary PostgreSQL URL

For a quick test database, run this in a terminal from the project directory:

```powershell
npx create-db@latest
```

The command prints a PostgreSQL connection string and a claim link. Open the claim link if you want to keep the database; otherwise, the temporary database is deleted after 24 hours. Keep the connection string private.

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the example `DATABASE_URL` with the complete connection string from the command. Keep the quotes, for example:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
PORT=3000
```

Do not paste the URL into chat or commit `.env`; it contains your database password. `.env` is ignored by Git. If your password contains reserved characters such as `@`, `:`, `/`, `?`, `#`, or spaces, URL-encode those characters before using the string.

Vite forwards `/api` requests to Express on port 3000. If you change `PORT` in `.env`, update the proxy target in `vite.config.js` to match.

## API routes

| Method | Route | Action |
| --- | --- | --- |
| `GET` | `/api/health` | Check API availability |
| `GET` | `/api/users` | List users |
| `GET` | `/api/users/:id` | Get one user |
| `POST` | `/api/users` | Create a user |
| `PUT` | `/api/users/:id` | Update a user's full name, email, and phone |
| `DELETE` | `/api/users/:id` | Delete a user |

Create and update requests use JSON with `fullName`, `email`, and `phone`. The API validates required fields and email format, normalizes email addresses to lowercase, and returns `409` when an email is already in use. The unique email constraint is enforced by PostgreSQL as well as the API.

`.env` is ignored by Git. Do not commit your database credentials.
# Crud
