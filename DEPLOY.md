# Deploy RentFlow to Railway

## 1. Prerequisites
- GitHub repo: https://github.com/THECROW2016/rentflow
- Railway account: https://railway.app

## 2. Create project
1. New Project → **Deploy from GitHub repo** → select `rentflow`
2. Add **PostgreSQL** (New → Database → PostgreSQL)
3. On the web service, open **Variables** and set:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Generate with `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | Your Railway public URL |
| `NODE_ENV` | `production` |

## 3. Deploy settings
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Pre-deploy:** `npx prisma db push --skip-generate`
- **Healthcheck:** `/api/health`

`railway.toml` configures most of this automatically.

## 4. Domain
Settings → Networking → **Generate Domain**, then set `NEXT_PUBLIC_APP_URL` and redeploy.

## 5. Seed (optional)
```bash
railway run npx tsx prisma/seed.ts
```
Demo: `owner@amaniproperties.co.ke` / `password123`

## Checklist
- [ ] Postgres linked via `DATABASE_URL`
- [ ] Strong `JWT_SECRET` (32+ chars)
- [ ] Pre-deploy runs schema push
- [ ] HTTPS domain works
- [ ] Login + Secure cookie in production
