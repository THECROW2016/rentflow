# RentFlow — Multi-Tenant Rental House Management System

A modern, production-ready **multi-tenant** web application for landlords and property management companies.

## Features

- **True multi-tenancy**: Each organization (landlord / agency) has fully isolated data via `organizationId` on every domain table.
- **Role-based access**: OWNER · ADMIN · MANAGER · STAFF
- **Properties & Units**: Create properties and units with status, rent, deposit.
- **Tenants & Leases**: Add tenants, create leases (auto-marks unit occupied).
- **Payments**: Record payments, **one-click Mark Paid**, overdue detection.
- **Maintenance tickets**: Create tickets, Start work / Complete / Cancel workflow.
- **Dashboard**: Occupancy, expected rent, overdue payments, open tickets.
- **Auth**: JWT in httpOnly cookie, bcrypt passwords, organization creation on signup.
- **Full CRUD forms**: Modal-based create forms on every major page (Server Actions + Zod).

## Tech Stack

| Layer        | Choice                          |
|--------------|---------------------------------|
| Framework    | Next.js 15 (App Router)         |
| Language     | TypeScript                      |
| Database     | SQLite (dev) / PostgreSQL ready |
| ORM          | Prisma                          |
| Auth         | Custom JWT (jose) + bcryptjs    |
| UI           | Tailwind CSS v4 + Lucide icons  |
| Validation   | Zod                             |

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open http://localhost:3000

### Demo accounts (password: `password123`)

| Role    | Email                          |
|---------|--------------------------------|
| Owner   | owner@amaniproperties.co.ke    |
| Manager | manager@amaniproperties.co.ke  |

## License

MIT
