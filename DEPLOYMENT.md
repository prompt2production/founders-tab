# Founders Tab Deployment Guide

## Prerequisites

- Ubuntu server with Docker and Docker Compose
- nginx-proxy with Let's Encrypt running
- DNS A record for `founderstab.com` pointing to server IP
- SendGrid API key

## Initial Setup

```bash
# 1. Create directories
ssh your-server
mkdir -p /opt/docker/founders-tab/uploads/receipts
cd /opt/docker/founders-tab

# 2. Clone repository
git clone https://github.com/your-repo/founders-tab.git .

# 3. Configure environment
cp .env.production.example .env
vi .env
```

Update `.env` with:
```env
DB_PASSWORD=<openssl rand -base64 24>
JWT_SECRET=<openssl rand -base64 32>
SENDGRID_API_KEY=<your-key>
SENDGRID_FROM_EMAIL=noreply@founderstab.com
```

```bash
# 4. Create network and start services
docker network create founderstab-network
docker compose -p founderstab -f docker-compose.infrastructure.yml up -d

# Wait for DB healthy status
docker inspect founderstab-db --format='{{.State.Health.Status}}'

# 5. Build and start application (10-20 min first build)
docker compose -p founderstab -f docker-compose.app.yml up -d --build

# 6. Run migrations
DB_PASS=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)

docker run --rm \
  --network founderstab-network \
  -e DATABASE_URL="postgresql://founderstab:${DB_PASS}@founderstab-db:5432/founderstab" \
  -v /opt/docker/founders-tab:/app \
  -w /app \
  node:20-alpine \
  sh -c 'npm install prisma && npx prisma migrate deploy'

# 7. Verify
docker compose -p founderstab -f docker-compose.app.yml ps
curl -I https://founderstab.com
```

## Ongoing Deployments

### Standard Update (No Migrations)

```bash
cd /opt/docker/founders-tab
git pull
docker compose -p founderstab -f docker-compose.app.yml up -d --build
```

### Update with Migrations

```bash
cd /opt/docker/founders-tab
git pull
docker compose -p founderstab -f docker-compose.app.yml up -d --build

# Run migrations (see step 6 above)
```

## Maintenance Commands

| Task | Command |
|------|---------|
| View logs | `docker compose -p founderstab -f docker-compose.app.yml logs -f app` |
| Restart app | `docker compose -p founderstab -f docker-compose.app.yml restart` |
| Rebuild app | `docker compose -p founderstab -f docker-compose.app.yml up -d --build` |
| Check status | `docker compose -p founderstab -f docker-compose.app.yml ps` |
| DB backup | `docker compose -p founderstab -f docker-compose.infrastructure.yml exec db pg_dump -U founderstab founderstab > backup.sql` |
| DB shell | `docker compose -p founderstab -f docker-compose.infrastructure.yml exec db psql -U founderstab founderstab` |
| Clean images | `docker image prune -a` |

## Rollback

```bash
cd /opt/docker/founders-tab
git log --oneline -10          # Find previous commit
git checkout <commit-hash>
docker compose -p founderstab -f docker-compose.app.yml up -d --build

# Return to latest
git checkout main && git pull
docker compose -p founderstab -f docker-compose.app.yml up -d --build
```

## Troubleshooting

**Build fails:** Retry `docker compose -p founderstab -f docker-compose.app.yml up -d --build`

**Volume mount error:** Ensure `/opt/docker/founders-tab/uploads/receipts` exists

**Container unhealthy:** Check logs `docker compose -p founderstab -f docker-compose.app.yml logs app`

**SSL issues:** Check `docker logs nginx-proxy-acme`

## Architecture

```
/opt/docker/founders-tab/
├── .env                              # Production environment
├── docker-compose.app.yml            # Next.js application
├── docker-compose.infrastructure.yml # PostgreSQL database
├── uploads/receipts/                 # Uploaded receipts (Docker volume)
└── [source files]
```

| Resource | Value |
|----------|-------|
| App container | `founderstab-app` |
| DB container | `founderstab-db` |
| DB port (host) | `5467` |
| Network | `founderstab-network` |
| Domain | `founderstab.com` |
