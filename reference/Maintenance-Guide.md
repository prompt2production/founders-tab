# PerkStation Maintenance Guide

Guide for deploying updates to PerkStation in production.

---

## Table of Contents

- [Standard Update (No Migrations)](#standard-update-no-migrations)
- [Update with Database Migrations](#update-with-database-migrations)
- [Rollback](#rollback)
- [Monitoring](#monitoring)
- [Database Operations](#database-operations)
- [Restart Services](#restart-services)
- [Clean Up](#clean-up)
- [Background Worker Service](#background-worker-service)
  - [Worker Status](#worker-status)
  - [View Worker Logs](#view-worker-logs)
  - [Restart Workers](#restart-workers)
  - [Deploy Worker Updates](#deploy-worker-updates)
  - [Manual Job Execution](#manual-job-execution)
  - [Scheduled Jobs](#scheduled-jobs)
  - [Worker Troubleshooting](#worker-troubleshooting)
  - [Worker Quick Reference](#worker-quick-reference)
- [Update Environment Variables](#update-environment-variables)
- [SSL Certificate Issues](#ssl-certificate-issues)
- [Quick Reference](#quick-reference)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Test Site Maintenance (perkstation.org)](#test-site-maintenance-perkstationorg)
  - [Standard Test Update (No Migrations)](#standard-test-update-no-migrations)
  - [Test Update with Database Migrations](#test-update-with-database-migrations)
  - [Test Site Monitoring](#test-site-monitoring)
  - [Test Database Operations](#test-database-operations)
  - [Test Site Quick Reference](#test-site-quick-reference)
  - [Deploying to Both Environments](#deploying-to-both-environments)
  - [Deploying Worker to Both Environments](#deploying-worker-to-both-environments)
  - [Full Deployment (App + Worker)](#full-deployment-app--worker)

---

## Standard Update (No Migrations)

```bash
ssh rocketscan
cd /opt/docker/perk-station

git pull
docker compose -p perkstation -f docker-compose.app.yml up -d --build
```

Verify:
```bash
docker compose -p perkstation -f docker-compose.app.yml ps
docker compose -p perkstation -f docker-compose.app.yml logs --tail=20 app
```

---

## Update with Database Migrations

### 1. Deploy Code

```bash
ssh rocketscan
cd /opt/docker/perk-station

git pull
docker compose -p perkstation -f docker-compose.app.yml up -d --build
```

### 2. Run Migrations

```bash
DB_PASS=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)

docker run --rm \
  --network perkstation-network \
  -e DATABASE_URL="postgresql://perkstation:${DB_PASS}@perkstation-db:5432/perkstation" \
  -v /opt/docker/perk-station/src:/app \
  -w /app \
  node:20-alpine \
  sh -c 'npm install prisma && echo "import { defineConfig } from \"prisma/config\"; export default defineConfig({ datasource: { url: process.env.DATABASE_URL } });" > prisma.config.ts && npx prisma migrate deploy --schema=prisma/schema.prisma'
```

### 3. Verify

```bash
docker compose -p perkstation -f docker-compose.app.yml logs --tail=30 app
curl -I https://perkstation.co.uk
```

---

## Rollback

### Rollback Code (No Migration Rollback)

```bash
cd /opt/docker/perk-station

# Find previous working commit
git log --oneline -10

# Checkout previous commit
git checkout <commit-hash>

# Rebuild
docker compose -p perkstation -f docker-compose.app.yml up -d --build
```

### Return to Latest

```bash
git checkout main
git pull
docker compose -p perkstation -f docker-compose.app.yml up -d --build
```

---

## Monitoring

### View Logs

```bash
# Live logs
docker compose -p perkstation -f docker-compose.app.yml logs -f app

# Last 100 lines
docker compose -p perkstation -f docker-compose.app.yml logs --tail=100 app

# Database logs
docker compose -p perkstation -f docker-compose.infrastructure.yml logs db
```

### Check Status

```bash
# Container status
docker compose -p perkstation -f docker-compose.app.yml ps

# Resource usage
docker stats perkstation-app perkstation-db --no-stream

# Disk space
df -h
docker system df
```

---

## Database Operations

### Backup

```bash
cd /opt/docker/perk-station
docker compose -p perkstation -f docker-compose.infrastructure.yml exec db \
  pg_dump -U perkstation perkstation > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore

```bash
cat backup_file.sql | docker compose -p perkstation -f docker-compose.infrastructure.yml exec -T db \
  psql -U perkstation perkstation
```

### Connect to Database

```bash
docker compose -p perkstation -f docker-compose.infrastructure.yml exec db \
  psql -U perkstation perkstation
```

---

## Restart Services

```bash
# Restart app only
docker compose -p perkstation -f docker-compose.app.yml restart

# Restart database (caution: brief downtime)
docker compose -p perkstation -f docker-compose.infrastructure.yml restart
```

---

## Clean Up

```bash
# Remove old Docker images
docker image prune -a

# Remove all unused resources
docker system prune -a

# Check what's using space
docker system df -v
```

---

## Background Worker Service

The background worker is a standalone Node.js service that runs scheduled jobs (e.g., processing ended budget periods). It runs separately from the Next.js application and connects directly to the database.

**Two instances run on the server:**
- `perk-station-worker` - Production (connects to production DB)
- `perk-station-worker-test` - Test (connects to test DB)

### Worker Status

```bash
# Check status of all workers
pm2 status

# Check specific worker
pm2 show perk-station-worker
pm2 show perk-station-worker-test
```

### View Worker Logs

```bash
# Production worker logs
pm2 logs perk-station-worker

# Test worker logs
pm2 logs perk-station-worker-test

# Last 100 lines
pm2 logs perk-station-worker --lines 100

# Follow logs in real-time
pm2 logs perk-station-worker --follow
```

### Restart Workers

```bash
# Restart production worker
pm2 restart perk-station-worker

# Restart test worker
pm2 restart perk-station-worker-test

# Restart all workers
pm2 restart all
```

### Deploy Worker Updates

When the worker code changes, you need to rebuild and restart:

```bash
cd /opt/docker/perk-station

# Pull latest code
git pull

# Rebuild production worker
cd worker
npm install
npm run build

# Restart production worker
pm2 restart perk-station-worker

# Restart test worker (uses same build)
pm2 restart perk-station-worker-test
```

### Manual Job Execution

To run a scheduled job immediately (useful for testing or one-off processing):

```bash
cd /opt/docker/perk-station/worker

# Run budget periods job on production DB
DATABASE_URL="postgresql://perkstation:<PROD_DB_PASS>@localhost:5464/perkstation" \
  npm run job:budget-periods

# Run budget periods job on test DB
DATABASE_URL="postgresql://perkstation:<TEST_DB_PASS>@localhost:5465/perkstation" \
  npm run job:budget-periods
```

### Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `process-budget-periods` | Daily 1:00 AM | Process ended budget periods, handle rollover/return-to-pot |

All times are UK timezone (Europe/London).

### Worker Troubleshooting

**Worker not running:**
```bash
# Check if worker process exists
pm2 status

# If not listed, start it
pm2 start /opt/docker/perk-station/worker/ecosystem.config.js --name perk-station-worker
```

**Worker keeps restarting:**
```bash
# Check error logs
pm2 logs perk-station-worker --err --lines 50

# Common issues:
# - DATABASE_URL not set or incorrect
# - Database not accessible
# - Missing node_modules (run npm install)
```

**Jobs not running on schedule:**
```bash
# Check worker is running
pm2 status

# Check worker logs for job execution
pm2 logs perk-station-worker --lines 200 | grep "ProcessBudgetPeriods"
```

### Worker Quick Reference

| Task | Command |
|------|---------|
| Status | `pm2 status` |
| Logs (production) | `pm2 logs perk-station-worker` |
| Logs (test) | `pm2 logs perk-station-worker-test` |
| Restart (production) | `pm2 restart perk-station-worker` |
| Restart (test) | `pm2 restart perk-station-worker-test` |
| Stop | `pm2 stop perk-station-worker` |
| Monitor | `pm2 monit` |

---

## Update Environment Variables

```bash
cd /opt/docker/perk-station
vi .env

# Recreate container to apply changes
docker compose -p perkstation -f docker-compose.app.yml up -d --force-recreate
```

---

## SSL Certificate Issues

Certificates are managed by nginx-proxy-acme. If issues occur:

```bash
# Check nginx-proxy logs
docker logs nginx-proxy-acme

# Force certificate renewal
docker exec nginx-proxy-acme /app/signal_le_service
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy update | `git pull && docker compose -p perkstation -f docker-compose.app.yml up -d --build` |
| View logs | `docker compose -p perkstation -f docker-compose.app.yml logs -f app` |
| Restart | `docker compose -p perkstation -f docker-compose.app.yml restart` |
| Status | `docker compose -p perkstation -f docker-compose.app.yml ps` |
| Backup DB | `docker compose -p perkstation -f docker-compose.infrastructure.yml exec db pg_dump -U perkstation perkstation > backup.sql` |
| DB shell | `docker compose -p perkstation -f docker-compose.infrastructure.yml exec db psql -U perkstation perkstation` |
| Worker status | `pm2 status` |
| Worker logs | `pm2 logs perk-station-worker` |
| Worker restart | `pm2 restart perk-station-worker` |

**Important:** Always use `-p perkstation` for production and `-p perkstation-test` for test to keep environments isolated.

---

## Pre-Deployment Checklist

- [ ] Changes tested locally with `npm run build`
- [ ] New migrations tested locally
- [ ] Code pushed to main branch
- [ ] Database backed up (if migrations involved)
- [ ] Worker changes tested locally (if applicable)

## Post-Deployment Checklist

- [ ] Containers healthy (`docker compose ps`)
- [ ] No errors in logs
- [ ] Site accessible via HTTPS
- [ ] Key functionality tested
- [ ] Workers running (`pm2 status`) - if worker code changed
- [ ] No errors in worker logs (`pm2 logs`)

---

## Test Site Maintenance (perkstation.org)

The test site uses separate containers and database but shares the same source code.

### Standard Test Update (No Migrations)

```bash
ssh rocketscan
cd /opt/docker/perk-station

git pull
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build
```

Verify:
```bash
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml ps
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml logs --tail=20 app
```

### Test Update with Database Migrations

#### 1. Deploy Code

```bash
ssh rocketscan
cd /opt/docker/perk-station

git pull
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build
```

#### 2. Run Migrations

```bash
DB_PASS=$(grep "^DB_PASSWORD=" .env.test | cut -d'=' -f2)

docker run --rm \
  --network perkstation-test-network \
  -e DATABASE_URL="postgresql://perkstation:${DB_PASS}@perkstation-test-db:5432/perkstation" \
  -v /opt/docker/perk-station/src:/app \
  -w /app \
  node:20-alpine \
  sh -c 'npm install prisma && echo "import { defineConfig } from \"prisma/config\"; export default defineConfig({ datasource: { url: process.env.DATABASE_URL } });" > prisma.config.ts && npx prisma migrate deploy --schema=prisma/schema.prisma'
```

#### 3. Verify

```bash
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml logs --tail=30 app
curl -I https://perkstation.org
```

### Test Site Monitoring

```bash
# Live logs
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml logs -f app

# Last 100 lines
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml logs --tail=100 app

# Database logs
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml logs db

# Container status
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml ps

# Resource usage (both environments)
docker stats perkstation-app perkstation-db perkstation-test-app perkstation-test-db --no-stream
```

### Test Database Operations

```bash
# Backup test DB
cd /opt/docker/perk-station
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml exec db \
  pg_dump -U perkstation perkstation > backup-test_$(date +%Y%m%d_%H%M%S).sql

# Restore test DB
cat backup-test_file.sql | docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml exec -T db \
  psql -U perkstation perkstation

# Connect to test database
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml exec db \
  psql -U perkstation perkstation
```

### Test Site Quick Reference

| Task | Command |
|------|---------|
| Deploy update | `git pull && docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build` |
| View logs | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml logs -f app` |
| Restart | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml restart` |
| Status | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml ps` |
| Backup DB | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml exec db pg_dump -U perkstation perkstation > backup-test.sql` |
| DB shell | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml exec db psql -U perkstation perkstation` |

### Deploying to Both Environments

To update both production and test simultaneously:

```bash
cd /opt/docker/perk-station
git pull

# Update production app
docker compose -p perkstation -f docker-compose.app.yml up -d --build

# Update test app
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build
```

### Deploying Worker to Both Environments

If worker code has changed:

```bash
cd /opt/docker/perk-station
git pull

# Rebuild worker
cd worker
npm install
npm run build

# Restart both worker instances
pm2 restart perk-station-worker
pm2 restart perk-station-worker-test

# Verify both are running
pm2 status
```

### Full Deployment (App + Worker)

When both application and worker code have changed:

```bash
cd /opt/docker/perk-station
git pull

# 1. Update production app
docker compose -p perkstation -f docker-compose.app.yml up -d --build

# 2. Update test app
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build

# 3. Rebuild and restart workers
cd worker
npm install
npm run build
pm2 restart perk-station-worker
pm2 restart perk-station-worker-test

# 4. Verify everything
docker compose -p perkstation -f docker-compose.app.yml ps
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml ps
pm2 status
```

---

*Last Updated: January 2025*
