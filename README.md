<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
=======
# AI Nutrition Advisor

AI Nutrition Advisor is a full-stack MERN + AI nutrition platform designed for a B.Tech major project. It includes user authentication, nutrition profile management, personalized calorie and macro analysis, meal-plan generation, progress tracking, AI nutrition guidance, and admin monitoring.

## Tech stack

- Frontend: React + Vite + React Router + Axios + Recharts + Lucide
- Backend: Node.js + Express + MongoDB + Mongoose
- Auth: JWT + bcryptjs
- AI: local safe fallback service pattern with environment-based provider toggle

## Project structure

- `frontend/` – React application
- `server/` – Express backend API

## Quick start

1. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

2. Configure MongoDB in `server/.env`. On Windows, copy the example file:
   ```bash
   Copy-Item server/.env.example server/.env
   ```

   For a local MongoDB installation, keep the example `MONGO_URI`:
   `mongodb://127.0.0.1:27017/ai_nutrition_advisor`

   Or, for MongoDB Atlas, replace it with your cluster connection string:
   `mongodb+srv://<username>:<password>@<cluster-host>/ai_nutrition_advisor?retryWrites=true&w=majority`
   Create a database user and allow your IP address in Atlas Network Access. URL-encode any special characters in the database username or password. Do not commit `server/.env`.

3. Start the backend from the `server` directory:
   ```bash
   npm run dev
   ```
   The API connects to MongoDB before accepting requests. On its first successful connection, it seeds the demo admin account and starter food catalog. Check `http://localhost:5000/api/health` for the connection status.
   `CLIENT_URL` in `server/.env` is a comma-separated list of allowed frontend origins. Include `http://localhost:5174` if Vite selects that port because `5173` is already in use.

4. Open a second terminal at the project root and install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

5. Start the frontend from the `frontend` directory:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```

6. Open the frontend URL shown in the terminal, usually `http://localhost:5173`.

## Demo credentials

- Admin:
  - Email: `admin@nutriai.com`
  - Password: `Admin@123`

## Important notes

- MongoDB is used when `MONGO_URI` is set. If the URI is configured but MongoDB cannot be reached, the backend exits instead of silently switching to temporary storage.
- Without `MONGO_URI`, the backend runs in an in-memory demo mode; changes are lost when it restarts.
- Admin dashboard totals use stored user, food, generated meal-plan, AI conversation, and progress-entry records. Generated meal plans are saved to MongoDB when configured; in in-memory demo mode, counts reset when the backend restarts.
- The seeded admin account is for development only. Change its password before deploying or exposing the application.
- AI provider calls are intentionally kept out of the React frontend.
- The app is educational nutrition guidance only and does not replace a doctor or nutritionist.
>>>>>>> 9a348de66f2df2f6c4cad08431c09acf670cef16
