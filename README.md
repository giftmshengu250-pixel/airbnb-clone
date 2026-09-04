# Airbnb Clone — Full Stack Project

This project has **three separate apps** that work together, matching the brief exactly:

```
airbnb-clone/
├── backend/          Node.js + Express + MongoDB API
├── frontend/          React app — the public Airbnb clone (Home, Locations, Location Details)
└── admin-frontend/    React app — the Admin Dashboard (login, create/view/update listings, reservations)
```

The two frontends talk to the backend over HTTP using `axios`, and the backend talks to
MongoDB using `mongoose`. Everything is linked together with `.env` files — no URLs or
secrets are hard-coded in the code.

---

## 1. One-time setup

### 1.1 Get a MongoDB connection string
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Click **Connect** → **Drivers**, and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/airbnb-clone
   ```
3. Replace `<username>` and `<password>` with your actual database user credentials.
4. In Atlas, under **Network Access**, add your IP address (or `0.0.0.0/0` for "allow from anywhere" while developing).

### 1.2 Install dependencies
From the `airbnb-clone` folder root, run:
```bash
npm run install:all
```
This installs the backend, frontend, and admin-frontend dependencies in one go.
(You can also `cd` into each folder and run `npm install` individually if you prefer.)

### 1.3 Configure your environment files
Each app has a `.env.example` file. Copy each one to `.env` in the same folder:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin-frontend/.env.example admin-frontend/.env
```

Then open **`backend/.env`** and paste in your MongoDB connection string and a random
secret string for JWT:

```
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/airbnb-clone
JWT_SECRET=any-long-random-string-you-make-up
PORT=5000
```

The `frontend/.env` and `admin-frontend/.env` files already point at
`http://localhost:5000/api` by default — no changes needed unless you change the backend's port.

---

## 2. Running the project

### Option A — run everything at once (recommended)
From the `airbnb-clone` root folder:
```bash
npm run dev
```
This starts the backend, the main frontend, and the admin frontend together in one
terminal, each with a different colored label. Keep this terminal window open — as long
as it's running, the backend stays "always on" in the background for both frontends to use.

- Backend API: http://localhost:5000
- Main site: http://localhost:5173
- Admin dashboard: http://localhost:5174 (Vite will tell you the exact port in the terminal)

### Option B — run each app separately
Open three terminal windows/tabs:

```bash
# Terminal 1 — backend (uses nodemon, restarts automatically on changes)
cd backend
npm run dev
```
```bash
# Terminal 2 — main frontend
cd frontend
npm run dev
```
```bash
# Terminal 3 — admin frontend
cd admin-frontend
npm run dev
```

### Keeping the backend running in the background permanently
For everyday development, `npm run dev` (via nodemon) in its own terminal is enough —
just don't close that terminal. If you want the backend to keep running even after you
close your terminal (e.g. while you're testing the frontend over a long session), you can
use [pm2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
cd backend
pm2 start server.js --name airbnb-backend
pm2 logs airbnb-backend   # view logs
pm2 stop airbnb-backend   # stop it later
```

---

## 3. Using the app

1. Go to the **admin dashboard** first (`admin-frontend`) and click **Become a host** to
   register an account. This creates a `host` user in MongoDB.
2. Log in, then **Create listing** to add a few accommodations (title, location, price,
   at least one image, etc.).
3. Go to the **main site** (`frontend`), search/browse locations, open a listing, and use
   the cost calculator + **Reserve** button (you'll need to register/log in as a regular
   guest there too — it's a separate login from the admin one).
4. Back in the admin dashboard, check **View reservations** to see bookings made on your
   listings. In the main site, check **My reservations** to see what you've booked.

---

## 4. Project structure (matches the backend brief exactly)

```
backend/
├── controllers/
│   ├── accommodationController.js
│   ├── reservationController.js
│   └── userController.js
├── models/
│   ├── Accommodation.js
│   ├── Reservation.js
│   └── User.js
├── routes/
│   ├── accommodationRoutes.js
│   ├── reservationRoutes.js
│   ├── userRoutes.js
│   └── uploadRoutes.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── errorHandler.js
├── config/db.js
├── uploads/           (uploaded listing images are saved here)
├── .env.example
├── package.json
└── server.js
```

## 5. API endpoints

| Method | Endpoint                          | Auth required | Description                        |
|--------|------------------------------------|:--------------:|-------------------------------------|
| POST   | `/api/users/register`             | No             | Create a user account               |
| POST   | `/api/users/login`                | No             | Log in, returns a JWT               |
| GET    | `/api/users/me`                   | Yes            | Get the current logged-in user      |
| POST   | `/api/accommodations`             | Yes            | Create a listing                    |
| GET    | `/api/accommodations`             | No             | Get all listings (optional `?location=`) |
| GET    | `/api/accommodations/:id`         | No             | Get one listing                     |
| PUT    | `/api/accommodations/:id`         | Yes (owner)     | Update a listing                    |
| DELETE | `/api/accommodations/:id`         | Yes (owner)     | Delete a listing                    |
| POST   | `/api/reservations`               | Yes             | Create a reservation                |
| GET    | `/api/reservations/host`          | Yes             | Reservations on your listings       |
| GET    | `/api/reservations/user`          | Yes             | Reservations you made                |
| DELETE | `/api/reservations/:id`           | Yes             | Cancel a reservation                |
| POST   | `/api/upload`                     | Yes             | Upload an image, returns its URL    |

---

## 6. Troubleshooting

- **"Could not load listings" / network errors in the frontend** → make sure the backend
  terminal is still running and shows `Server running on http://localhost:5000`.
- **MongoDB connection errors on backend startup** → double check `MONGO_URI` in
  `backend/.env` (username/password/cluster name) and that your IP is allowed in Atlas
  Network Access.
- **Images not showing** → the backend serves uploaded images from
  `http://localhost:5000/uploads/...`; make sure the backend is running when viewing them.
