# 🩸 Blood Donation & Emergency Assistance Platform

A backend-only REST API that connects patients and hospitals in need of blood with
compatible, available donors — with a companion fundraising module so well-wishers
can help cover a patient's treatment costs.

> This is **not** a payment-for-blood system. All Stripe-backed payments in this
> project fund a patient's treatment campaign; blood itself is never bought or sold.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Runtime & Framework | Node.js, TypeScript, Express.js |
| Database & ORM | PostgreSQL + Prisma (multi-file schema) |
| Validation | Zod |
| Authentication | Custom (email/password) + Google OAuth, Bearer tokens |
| Payments | Stripe |
| Documentation | Postman |

---

## 👥 User Roles & Permissions

| Role | Description |
|---|---|
| `ADMIN` | Verifies blood requests and campaigns, manages users (soft delete/restore), full read access |
| `PATIENT` | Creates and manages their own blood requests, accepts donor matches, marks donations complete, can create/contribute to campaigns |
| `DONOR` | Maintains a donor profile, checks eligibility, views matching requests, logs donations |
| `HOSPITAL` | Same request/campaign capabilities as `PATIENT`, representing an organizational requester |

All protected routes require a **Bearer token** in the `Authorization` header. Role
access is enforced per-route via the `auth(...roles)` middleware.

---

## ✨ Core Features

- Donor registration with blood group, availability, and last-donation tracking
- Emergency blood request creation, verification, and lifecycle management
- Donor-to-request matching with accept/decline handling
- Donation logging and completion tracking
- Admin verification workflow for requests and campaigns
- Soft delete / restore for user accounts
- Treatment-fund campaigns tied to a blood request
- Stripe-backed contributions with personal and admin-wide history views
- Google OAuth login alongside standard email/password auth

---

## 📁 Project Structure

```
src/
├── app/
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── validationRequest.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.controller.ts
│       │   ├── auth.route.ts
│       │   └── authValidation.ts
│       ├── admin/
│       │   ├── admin.controller.ts
│       │   └── admin.route.ts
│       ├── patient/
│       │   ├── patient.controller.ts
│       │   ├── patient.route.ts
│       │   └── patient.validation.ts
│       ├── donor/
│       │   └── donor.route.ts / donor.controller.ts
│       ├── request/
│       │   └── request.route.ts / request.controller.ts
│       ├── campaign/
│       │   └── campaign.route.ts / campaign.controller.ts / campaign.validation.ts
│       └── contribution/
│           └── contribution.route.ts / contribution.controller.ts
prisma/
├── schema.prisma
└── models/
    ├── enums.prisma
    ├── user.prisma
    ├── donor.prisma
    ├── request.prisma
    ├── payment.prisma
    └── notification.prisma
```

---

## 🗄️ Database Overview

11 core tables, organized around 4 domains:

- **Identity** — `User`, `RefreshToken`, `VolunteerAssignment`
- **Donor** — `DonorProfile`
- **Requests** — `BloodRequest`, `DonorMatch`, `Donation`
- **Fundraising** — `Campaign`, `Contribution`
- **System** — `Notification`, `AuditLog`

See `prisma/schema.prisma` and `prisma/models/*.prisma` for the full relational
definition, including cascade rules, indexes, and the `@@unique([requestId, donorId])`
constraint on `DonorMatch` that prevents a donor being double-assigned to the same
request.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- A Stripe account (test mode is fine)

### Setup

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
cp .env.example .env
npx prisma format
npx prisma migrate dev --name init
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PORT` | Server port (e.g. `3000`) |

---

## 📡 API Reference

All routes are versioned under `/api/v1`. Responses follow:

```json
// Success
{ "success": true, "message": "Operation successful", "data": {} }

// Error
{ "success": false, "message": "Something went wrong", "errors": [] }
```

### Auth — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/verify-email` | Public | Verify email via token/OTP |
| POST | `/login` | Public | Email/password login |
| POST | `/google` | Public | Google OAuth login |
| GET | `/me` | All roles | Get current user's profile |
| PATCH | `/me` | All roles | Update current user's profile |

### Admin — `/api/v1/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| PATCH | `/request/verify/:requestId` | Admin | Verify a blood request |
| PATCH | `/campaign/verify/:id` | Admin | Verify a fundraising campaign |
| GET | `/users` | Admin | List all users |
| PATCH | `/user/:id/delete` | Admin | Soft-delete a user |
| PATCH | `/user/:id/restore` | Admin | Restore a soft-deleted user |

### Patient — `/api/v1/patient`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/request` | Patient, Hospital | Create a blood request |
| GET | `/myRequest` | Patient, Hospital | List my requests |
| PATCH | `/myRequest/:requestId` | Patient, Hospital | Update my request |
| DELETE | `/myRequest/:requestId` | Patient, Hospital | Soft-delete my request |

### Donor — `/api/v1/donor`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/donor-profile` | Donor | Create donor profile |
| PATCH | `/donor-profile/me` | Donor | Update my donor profile |
| GET | `/eligibility` | Donor | Check my donation eligibility |
| GET | `/matching-requests` | Donor | List requests matching my blood group/location |
| POST | `/create-donation` | Donor | Log a donation |
| GET | `/create-donation/me` | Donor | List my donation history |

### Requests (shared) — `/api/v1/requests`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | All roles | List all blood requests |
| GET | `/:id` | All roles | Get a single request's details |
| POST | `/matches/:id/accept` | Patient, Hospital | Accept a donor match on my request |
| PATCH | `/donations/:id/complete` | Patient, Hospital, Admin | Mark a donation as completed |

### Campaign — `/api/v1/campaign`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Admin, Hospital | Create a fundraising campaign |
| GET | `/` | All roles | List all campaigns |
| GET | `/myCampaign` | Admin, Hospital | List campaigns I created |
| GET | `/contribution/history/:id` | Admin, Hospital | Contribution history for a campaign |
| GET | `/:id` | All roles | Get a single campaign's details |

### Contribution — `/api/v1/contribution`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/create` | All roles | Contribute to a campaign (Stripe) |
| GET | `/history` | Admin | List all contributions system-wide |
| GET | `/history/me` | All roles | List my own contribution history |

**33 endpoints total** — exceeds the 20-endpoint minimum.

---

## 🔐 Security

- Passwords hashed before storage; JWT access + refresh token pair
- Bearer-token authentication and role-based middleware on every protected route
- Rate limiting (`express-rate-limit`) and security headers (`helmet`) on all routes
- CORS configured for known frontend/client origins only

---

## 🧠 Business Logic Highlights

- **Blood compatibility & eligibility** — donor matching checks blood-group compatibility rules and a minimum gap since `lastDonationDate` before surfacing a donor as eligible
- **Duplicate-assignment prevention** — a unique constraint on `(requestId, donorId)` stops the same donor being matched to a request twice
- **Request lifecycle** — `PENDING → VERIFIED → MATCHING → FULFILLED` (or `CANCELLED` / `EXPIRED`), each transition gated by role and validated server-side
- **Soft deletes** — users and requests are deactivated via `deletedAt`, never hard-deleted
- **Fundraising vs. blood** — `Campaign`/`Contribution` are entirely separate from the blood-request/donation flow; money never changes hands for blood itself

---

## 🧪 Testing & Documentation

API testing and interactive documentation are maintained in Postman. Import the
collection from `/docs/postman_collection.json` (or the shared workspace link) to
try every endpoint listed above.

---

## 📦 Deployment

Deployed as serverless functions on Vercel (or a persistent Node process on Render).
Ensure all environment variables above are set in the deployment platform before
running database migrations against the production `DATABASE_URL`.