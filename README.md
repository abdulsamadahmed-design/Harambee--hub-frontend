# Harambee Hub: Frontend

Harambee Hub is a fundraising platform for weddings, funerals, school fees and community needs. Organizers create campaigns, contributors pledge money, and admins manage users. This is the React frontend; it talks to the Flask backend in the `Harambee--hub_backend` repository.

## Tech stack
- React with Vite
- React Router for pages
- The Fetch API, wrapped in `src/services/api.js`

## Getting started
1. Clone the repo and install packages: `npm install`
2. Create a `.env` file in the project root:
   `VITE_API_URL=http://localhost:5000/api`
3. Start the backend (see the backend README), then run: `npm run dev`
4. Open the address shown in the terminal (usually http://localhost:5173)

## Working without the backend
Sample data lives in `db.json`. Start a fake server with `npx json-server db.json --port 3001` and set `VITE_API_URL=http://localhost:3001` in `.env`.

## Project structure
- `src/services/api.js`: sends every request to the backend and adds the login token
- `src/hooks/useFetch.js`: loads data and returns `{ data, loading, error, refetch }`
- `src/components/common/`: `Loader`, `ErrorMessage` and `EmptyState`
- `src/components/campaigns/`, `pledges/`, `dashboard/`: feature components
- `src/pages/`: public, auth, organizer, contributor and admin pages
- `src/context/AuthContext.jsx`: who is logged in
- `src/routes/`: page routes and protected routes

## Using the shared helpers
```jsx
const { data, loading, error, refetch } = useFetch("/campaigns");
if (loading) return <Loader />;
if (error) return <ErrorMessage message={error} onRetry={refetch} />;
if (data.length === 0) return <EmptyState title="No campaigns yet" />;
```

## Roles
- organizer: creates and manages campaigns
- contributor: pledges to campaigns
- admin: manages users and sees site statistics

## Team workflow
- Branch from `develop`: `feature/<slice>-<name>`
- Commit messages start with `feat:` or `fix:`
- Open a pull request into `develop`; only M1 merges
- Never push directly to `main` or `develop`
