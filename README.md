## P2 Backend (Next.js API + MongoDB)

This backend exposes REST endpoints under `/api/*` for the frontend in `/Users/apple/Web_2_Hsu/P2-front`.

### 1) Install dependencies

```bash
cd /Users/apple/Web_2_Hsu/p2_back
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` (example: `mongodb://127.0.0.1:27017`)
- `MONGODB_DB` (example: `freelance_platform`)
- `JWT_SECRET`
- `CORS_ORIGIN` (frontend URL, default `http://127.0.0.1:5173`)

### 3) Run backend on port 5000

```bash
npm run dev:5000
```

API base URL:
- `http://127.0.0.1:5000/api`

### Implemented API groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/jobs`
- `GET/PUT/DELETE /api/jobs/:id`
- `GET/POST /api/proposals`
- `GET/DELETE /api/proposals/:id`
- `PATCH /api/proposals/:id/accept`
- `PATCH /api/proposals/:id/reject`
- `GET /api/contracts`
- `PATCH /api/contracts/:id/complete`
- `GET/POST /api/payments`
- `GET/POST /api/reviews`
- `GET/DELETE /api/reviews/:id`
- `GET/PATCH /api/admin/users`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/stats`
- `GET /api/dashboard`

### Frontend note

Frontend service base URL is expected to be:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

Set this in `/Users/apple/Web_2_Hsu/P2-front/.env` (or `.env.local`).
