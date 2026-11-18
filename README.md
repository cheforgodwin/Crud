# User CRUD app

React and Vite provide the user management screen. The Express API follows MVC: route definitions live in `server/routes`, request handling and validation in `server/controllers`, and Prisma database access in `server/models`. PostgreSQL is the database; Prisma defines and migrates its schema.

## Set up

1. Install packages: `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string. The value in the example is a placeholder, not a real database.
3. Apply the schema: `npm run db:migrate -- --name create_user`.
4. Start the API: `npm run dev:api`.
5. In a second terminal, start the frontend: `npm run dev`.

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
