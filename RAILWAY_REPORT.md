# Railway Deployment Report

## 1. Deployment process

1. Create Railway account and new project.
2. Connect GitHub repository to Railway (TaskManager project).
3. Add plugin: PostgreSQL.
4. Railway provisioned database and set `DATABASE_URL` automatically.
5. Add environment variables in Railway settings: `NODE_ENV=production`, `PORT=3000` (optional).
6. Push repo; Railway detected `Procfile` and began deployment.
7. Confirmed service health with `GET /health` and app page via Railway URL.

## 2. Schema and sample data

- Schema is in `schema.sql`.
- Table: `tasks`, columns: `id`(uuid), `title`, `description`, `status`, `created_at`.
- Row Level Security policies open for development purpose.
- To seed sample data run:

```sql
INSERT INTO tasks (title, description, status) VALUES
('Demo onboarding', 'Walk through project flow', 'pending'),
('Fix UI spacing', 'Improve readibility on mobile', 'in-progress'),
('Release to Railway', 'Confirm deployed URL and CI/CD', 'completed');
```

## 3. Environment and secure config

- Local `.env` file holds sensitive connection string.
- Railway provides managed `DATABASE_URL` value and injects it in runtime.
- Code uses `process.env.DATABASE_URL` with SSL required in production mode.

## 4. Scalability awareness

### Railway usage-based cost factors
- CPU/memory rack durations
- Database row count/storage
- Network ingress/egress

### Scaling strategy
- Add extra service instances in Railway if load increases.
- Use task status indexes and paginate `GET /api/tasks` for large datasets.
- Cache read queries with Redis (future scope).

## 5. CI/CD workflow

- GitHub integration triggers redeploy on commit.
- `Procfile` sets run command: `web: npm start`.

## 6. Monitoring & logging

- Railway dashboard provides logs stream.
- Verified by creating an error (temporary wrong env var) and observing failure details.
- Use all logs for debugging and health check endpoint.

## 7. Challenges and solutions

- `setInterval` not needed (app is read-on-demand) to avoid extra resources.
- RLS policies included; in production tighten to authenticated requests.
- Added inline edit and filter to improve UX.

## 8. PaaS comparison: Railway vs Heroku

- Railway has usage-based billing and fast provisioning.
- Heroku offers more built-in add-ons and established ecosystem.
- Both support Git-based CI/CD and environment variable management.
- Railway has a simpler free tier and faster startup for small projects.

---

## 9. Run locally

```
npm install
cp .env.example .env
# set DATABASE_URL
psql $DATABASE_URL -f schema.sql
npm start
```

## 10. Checklist
- [x] Deployed app URL
- [x] Source code link
- [x] Database schema + sample data
- [x] Documentation and reflection
- [x] Railway environment variables
- [x] CI/CD integration (GitHub)
- [x] Monitoring/logging research
