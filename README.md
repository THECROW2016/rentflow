# RentFlow

Production-ready multi-tenant rental house management system.

## Stack

- Next.js 15.2.8 · Prisma · PostgreSQL · Tailwind 3 · Zod · jose · bcryptjs

## Local

```bash
npm install
cp .env.example .env
# set DATABASE_URL + JWT_SECRET
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Demo: `owner@amaniproperties.co.ke` / `password123`

## Railway

1. Deploy from GitHub
2. Add PostgreSQL
3. Variables: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `JWT_SECRET` (32+ chars), `NEXT_PUBLIC_APP_URL`, `NODE_ENV=production`
4. Pre-deploy: `npx prisma db push --skip-generate` (in railway.toml)
5. Generate domain · optional seed via `railway run npx tsx prisma/seed.ts`
