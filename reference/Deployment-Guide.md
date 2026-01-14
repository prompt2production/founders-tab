# PerkStation Deployment Guide

Complete guide for deploying PerkStation to a production server.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Deployment (Fresh Server)](#initial-deployment-fresh-server)
  - [1. Create Directories](#1-create-directories)
  - [2. Clone Repository](#2-clone-repository)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Create Docker Network](#4-create-docker-network)
  - [5. Start Database](#5-start-database)
  - [6. Build and Start Application](#6-build-and-start-application)
  - [7. Run Migrations](#7-run-migrations)
  - [8. Verify Deployment](#8-verify-deployment)
  - [9. Set Up Background Worker (Production)](#9-set-up-background-worker-production)
- [Ongoing Deployments](#ongoing-deployments)
  - [Quick Deploy](#quick-deploy)
  - [Deploy with Migrations](#deploy-with-migrations)
- [Seeding Demo Data](#seeding-demo-data)
- [Quick Reference](#quick-reference)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Test Site Deployment (perkstation.org)](#test-site-deployment-perkstationorg)
  - [Test Site Architecture](#test-site-architecture)
  - [Initial Test Site Setup](#initial-test-site-setup)
  - [Ongoing Test Deployments](#ongoing-test-deployments)
  - [Test Site Quick Reference](#test-site-quick-reference)

---

## Prerequisites

- Ubuntu server with Docker and Docker Compose installed
- nginx-proxy with Let's Encrypt already running
- DNS A record pointing to server IP
- SSH access to server
- SendGrid API key for emails

---

## Initial Deployment (Fresh Server)

### 1. Create Directories

```bash
ssh your-server
mkdir -p /opt/docker/perk-station
mkdir -p /opt/docker/perk-station/uploads/logos
mkdir -p /opt/docker/perk-station/uploads/offers
cd /opt/docker/perk-station
```

### 2. Clone Repository

```bash
git clone https://github.com/chrisongithub1977/perk-station.git .
```

### 3. Configure Environment

```bash
cp .env.example .env
vi .env
```

Update these values:

```env
DB_PASSWORD=<generate-with: openssl rand -base64 24>
JWT_SECRET=<generate-with: openssl rand -base64 32>
SENDGRID_API_KEY=<your-sendgrid-key>
SENDGRID_FROM_EMAIL=noreply@perkstation.co.uk
NEXT_PUBLIC_APP_URL=https://perkstation.co.uk
PROD_DOMAIN=perkstation.co.uk,*.perkstation.co.uk
LETSENCRYPT_DOMAIN=perkstation.co.uk
LETSENCRYPT_EMAIL=admin@perkstation.co.uk
```

### 4. Create Docker Network

```bash
docker network create perkstation-network
```

### 5. Start Database

```bash
docker compose -p perkstation -f docker-compose.infrastructure.yml up -d

# Wait for healthy status
docker inspect perkstation-db --format='{{.State.Health.Status}}'
```

### 6. Build and Start Application

```bash
docker compose -p perkstation -f docker-compose.app.yml up -d --build
```

**Note:** The `-p perkstation` flag sets an explicit project name. This is required because both production and test environments share the same directory. Without it, Docker Compose treats all compose files as one project and running one affects the other.

First build takes 10-20 minutes (npm install + Next.js build).

### 7. Run Migrations

Prisma 7 requires a workaround for migrations in Docker:

```bash
# Get your DB_PASSWORD from .env
DB_PASS=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)

# Run migrations via temporary container
docker run --rm \
  --network perkstation-network \
  -e DATABASE_URL="postgresql://perkstation:${DB_PASS}@perkstation-db:5432/perkstation" \
  -v /opt/docker/perk-station/src:/app \
  -w /app \
  node:20-alpine \
  sh -c 'npm install prisma && echo "import { defineConfig } from \"prisma/config\"; export default defineConfig({ datasource: { url: process.env.DATABASE_URL } });" > prisma.config.ts && npx prisma migrate deploy --schema=prisma/schema.prisma'
```

### 8. Verify Deployment

```bash
# Check containers
docker compose -f docker-compose.app.yml ps

# Check logs
docker compose -f docker-compose.app.yml logs --tail=20 app

# Test HTTPS
curl -I https://perkstation.co.uk
```

### 9. Set Up Background Worker (Production)

The background worker handles scheduled jobs like processing ended budget periods.

#### Install PM2 Globally

```bash
npm install -g pm2
```

#### Install Worker Dependencies

```bash
cd /opt/docker/perk-station/worker
npm install
npm run build
```

#### Create Production Worker Environment

```bash
cd /opt/docker/perk-station/worker

# Create .env file for production worker
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://perkstation:<PROD_DB_PASS>@localhost:5464/perkstation
EOF

# Replace <PROD_DB_PASS> with actual password from .env
DB_PASS=$(grep "^DB_PASSWORD=" /opt/docker/perk-station/.env | cut -d'=' -f2)
sed -i "s/<PROD_DB_PASS>/$DB_PASS/" .env
```

#### Start Production Worker

```bash
cd /opt/docker/perk-station/worker

# Start with PM2
pm2 start ecosystem.config.js --name perk-station-worker --env production

# Save PM2 configuration (survives reboots)
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

#### Verify Worker

```bash
pm2 status
pm2 logs perk-station-worker --lines 20
```

---

## Ongoing Deployments

### Quick Deploy

```bash
cd /opt/docker/perk-station
git pull
docker compose -p perkstation -f docker-compose.app.yml up -d --build
```

### Deploy with Migrations

```bash
cd /opt/docker/perk-station
git pull
docker compose -p perkstation -f docker-compose.app.yml up -d --build

# Run migrations (see Step 7 above for full command)
```

---

## Seeding Demo Data

Option 1: Run from local machine (recommended):

```bash
# In utility/.env, set:
DATABASE_URL="postgresql://perkstation:<password>@<server-ip>:5464/perkstation"

# Then run:
cd utility
npm install
npm run seed
```

Option 2: Basic seed via Docker (minimal data):

```bash
# Similar to migrations, but run: npx prisma db seed
```

---

## Quick Reference

| Task | Command |
|------|---------|
| View logs | `docker compose -p perkstation -f docker-compose.app.yml logs -f app` |
| Restart app | `docker compose -p perkstation -f docker-compose.app.yml restart` |
| Rebuild app | `docker compose -p perkstation -f docker-compose.app.yml up -d --build` |
| Check status | `docker compose -p perkstation -f docker-compose.app.yml ps` |
| DB backup | `docker compose -p perkstation -f docker-compose.infrastructure.yml exec db pg_dump -U perkstation perkstation > backup.sql` |
| Worker status | `pm2 status` |
| Worker logs | `pm2 logs perk-station-worker` |
| Worker restart | `pm2 restart perk-station-worker` |

---

## Troubleshooting

### Build Fails on npm ci
Network timeout. Retry: `docker compose -f docker-compose.app.yml up -d --build`

### Volume Mount Error
Create upload directories:
```bash
mkdir -p /opt/docker/perk-station/uploads/{logos,offers}
```

### Container Not Healthy
Check logs: `docker compose -f docker-compose.app.yml logs app`

### DNS Not Resolving Subdomains
Add wildcard A record: `*.perkstation.co.uk` → server IP

---

## Architecture

```
/opt/docker/perk-station/
├── .env                          # Production environment variables
├── .env.test                     # Test environment variables
├── docker-compose.app.yml        # Production Next.js application
├── docker-compose.infrastructure.yml  # Production PostgreSQL
├── docker-compose.test.app.yml   # Test Next.js application
├── docker-compose.test.infrastructure.yml  # Test PostgreSQL
├── uploads/                      # Production uploads (Docker volume)
│   ├── logos/
│   └── offers/
├── uploads-test/                 # Test uploads (Docker volume)
│   ├── logos/
│   └── offers/
├── src/                          # Application source
└── worker/                       # Background worker service
    ├── .env                      # Production worker env
    ├── .env.test                 # Test worker env
    ├── ecosystem.config.js       # PM2 config (production)
    ├── ecosystem.test.config.js  # PM2 config (test)
    └── src/                      # Worker source
```

**Docker Containers:**
| Container | Production | Test |
|-----------|------------|------|
| App | `perkstation-app` | `perkstation-test-app` |
| Database | `perkstation-db` | `perkstation-test-db` |

**PM2 Processes:**
| Process | Database |
|---------|----------|
| `perk-station-worker` | Production (port 5464) |
| `perk-station-worker-test` | Test (port 5465) |

**Networks:**
- `perkstation-network` - Production internal (app ↔ db)
- `perkstation-test-network` - Test internal (app ↔ db)
- `nginx-proxy` - External (nginx-proxy ↔ apps)

**Ports:**
- 5464 (host) → 5432 (Production PostgreSQL)
- 5465 (host) → 5432 (Test PostgreSQL)
- 3000 (container only, routed via nginx-proxy)

---

## Test Site Deployment (perkstation.org)

The test site runs alongside production on the same server, with isolated database and containers.

### Test Site Architecture

```
/opt/docker/perk-station/
├── .env                                    # Production environment
├── .env.test                               # Test environment
├── docker-compose.infrastructure.yml       # Production DB
├── docker-compose.app.yml                  # Production app
├── docker-compose.test.infrastructure.yml  # Test DB
├── docker-compose.test.app.yml             # Test app
├── uploads/                                # Production uploads
├── uploads-test/                           # Test uploads
└── src/                                    # Shared source code
```

| Resource | Production | Test |
|----------|-----------|------|
| App container | `perkstation-app` | `perkstation-test-app` |
| DB container | `perkstation-db` | `perkstation-test-db` |
| DB port (host) | `5464` | `5465` |
| Network | `perkstation-network` | `perkstation-test-network` |
| Domain | `perkstation.co.uk` | `perkstation.org` |

### Initial Test Site Setup

#### 1. DNS Configuration

Add A record for `perkstation.org` pointing to server IP.
Optionally add wildcard: `*.perkstation.org` for tenant subdomains.

#### 2. Create Test Directories

```bash
ssh your-server
cd /opt/docker/perk-station
mkdir -p uploads-test/logos uploads-test/offers
```

#### 3. Create Test Network

```bash
docker network create perkstation-test-network
```

#### 4. Configure Test Environment

```bash
cp .env .env.test
vi .env.test
```

Update these values in `.env.test`:

```env
DB_PASSWORD=<generate-new: openssl rand -base64 24>
JWT_SECRET=<generate-new: openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=https://perkstation.org
PROD_DOMAIN=perkstation.org,*.perkstation.org
LETSENCRYPT_DOMAIN=perkstation.org
LETSENCRYPT_EMAIL=admin@perkstation.org
SENDGRID_FROM_EMAIL=noreply@perkstation.org
```

#### 5. Start Test Database

```bash
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml up -d

# Wait for healthy status
docker inspect perkstation-test-db --format='{{.State.Health.Status}}'
```

#### 6. Build and Start Test Application

```bash
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build
```

#### 7. Run Migrations on Test Database

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

#### 8. Verify Test Deployment

```bash
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml ps
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml logs --tail=20 app
curl -I https://perkstation.org
```

#### 9. Set Up Background Worker (Test)

The test worker runs alongside the production worker but connects to the test database.

##### Create Test Worker Environment

```bash
cd /opt/docker/perk-station/worker

# Create .env.test file for test worker
cat > .env.test << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://perkstation:<TEST_DB_PASS>@localhost:5465/perkstation
EOF

# Replace <TEST_DB_PASS> with actual password from .env.test
DB_PASS=$(grep "^DB_PASSWORD=" /opt/docker/perk-station/.env.test | cut -d'=' -f2)
sed -i "s/<TEST_DB_PASS>/$DB_PASS/" .env.test
```

##### Create Test Worker PM2 Config

```bash
cd /opt/docker/perk-station/worker

# Create separate ecosystem config for test
cat > ecosystem.test.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'perk-station-worker-test',
      script: 'npm',
      args: 'run start:prod',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      log_file: './logs/test-combined.log',
      error_file: './logs/test-error.log',
      out_file: './logs/test-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
EOF
```

##### Start Test Worker

```bash
cd /opt/docker/perk-station/worker

# Load test environment and start
pm2 start ecosystem.test.config.js --env-file .env.test

# Save PM2 configuration
pm2 save
```

##### Verify Test Worker

```bash
pm2 status
pm2 logs perk-station-worker-test --lines 20
```

### Ongoing Test Deployments

```bash
cd /opt/docker/perk-station
git pull
docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build
```

### Test Site Quick Reference

| Task | Command |
|------|---------|
| View logs | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml logs -f app` |
| Restart app | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml restart` |
| Rebuild app | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml up -d --build` |
| Check status | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.app.yml ps` |
| DB backup | `docker compose -p perkstation-test --env-file .env.test -f docker-compose.test.infrastructure.yml exec db pg_dump -U perkstation perkstation > backup-test.sql` |
| Worker logs | `pm2 logs perk-station-worker-test` |
| Worker restart | `pm2 restart perk-station-worker-test` |

---

*Last Updated: January 2025*
