# LAPNESIA CI/CD PIPELINE — PHASE 3 IMPLEMENTATION
**Date:** 2026-07-14  
**Status:** ✅ COMPLETE

---

## GITHUB ACTIONS WORKFLOW

### Pipeline Overview

```
Push to GitHub
    ↓
├─→ Lint & Code Quality (PHPStan, Pint)
├─→ Unit & Feature Tests (PHPUnit)
├─→ Build Frontend (Node.js)
├─→ Security Scan (Composer Audit, SonarQube)
├─→ Docker Build & Push
    ↓
    If develop branch:
    └─→ Deploy to Staging
    
    If main branch:
    └─→ Deploy to Production
```

---

## WORKFLOW JOBS

### 1. Lint & Code Quality
**File:** `.github/workflows/ci-cd.yml` - `lint` job

```yaml
- PHPStan Level 8 analysis
- Pint code formatter check
- Excludes: Kernel, Handler, Middleware
```

**Run Locally:**
```bash
cd Backend
./vendor/bin/phpstan analyse --memory-limit=512M
./vendor/bin/pint --test
```

### 2. Unit & Feature Tests
**File:** `.github/workflows/ci-cd.yml` - `test` job

**Services:**
- MariaDB 10.6 (testing database)
- Redis 7 (cache & queue)

**Tests Run:**
- Unit tests (policies, models)
- Feature tests (authorization, endpoints)
- Coverage report (HTML + Clover XML)

**Coverage Artifacts:**
- Uploaded to Codecov
- Archived for 30 days
- Target: 80%+

**Run Locally:**
```bash
cd Backend
php artisan test --coverage
```

### 3. Frontend Build
**File:** `.github/workflows/ci-cd.yml` - `build-frontend` job

**Steps:**
- Setup Node.js 18
- npm ci (clean install)
- npm run build (Vite build)
- Archive dist/ folder

**Artifacts:**
- Retained for 5 days
- Ready for Docker image

**Run Locally:**
```bash
cd Frontend
npm install
npm run build
```

### 4. Docker Build & Push
**File:** `.github/workflows/ci-cd.yml` - `docker-build` job

**Triggers:** Push to main or develop

**Actions:**
- Set up Docker Buildx
- Login to GitHub Container Registry
- Build multi-platform image
- Push with tags:
  - `latest` (main branch)
  - Branch name (develop → develop)
  - Commit SHA
  - Semantic version (if tagged)

**Registry:** `ghcr.io/user/lapnesia`

### 5. Security Scan
**File:** `.github/workflows/ci-cd.yml` - `security-scan` job

**Tools:**
- Composer Audit (dependency vulnerabilities)
- SonarQube (code quality)

**SonarQube Config:** `sonar-project.properties`

**Run Locally:**
```bash
cd Backend
composer audit
```

### 6. Deploy to Staging
**Triggers:** Push to develop branch

**Actions:**
- SSH into staging server
- Pull latest Docker image
- Run migrations
- Restart services

**Environment Variables:**
- `STAGING_DEPLOY_KEY`
- `STAGING_DEPLOY_HOST`
- `STAGING_DEPLOY_USER`

### 7. Deploy to Production
**Triggers:** Push to main branch

**Prerequisites:**
- All tests pass ✅
- Security scan passes ✅
- Docker image built ✅

**Actions:**
- SSH into production server
- Pull latest Docker image
- Run migrations
- Clear cache
- Notify via Slack

**Environment:**
- Protected branch (requires review)
- Environment secrets

---

## CONFIGURATION FILES CREATED

### GitHub Workflow
**File:** `.github/workflows/ci-cd.yml` (470+ lines)
- ✅ 7 jobs configured
- ✅ Caching enabled (Composer, npm)
- ✅ Service containers (MySQL, Redis)
- ✅ Artifact uploads (coverage, builds)
- ✅ Deployment steps (staging/prod)
- ✅ Slack notifications

### Code Quality
**Files:**
- `Backend/phpstan.neon` — PHPStan configuration (Level 8)
- `Backend/pint.json` — Code formatter rules (Laravel preset)

### Quality Gate
**File:** `sonar-project.properties` — SonarQube configuration
- Project key: `lapnesia`
- Coverage reports
- Exclusions configured

---

## SETUP INSTRUCTIONS

### 1. GitHub Secrets

Add to repository settings:

```
STAGING_DEPLOY_KEY      = Private SSH key for staging
STAGING_DEPLOY_HOST     = Staging server IP/hostname
STAGING_DEPLOY_USER     = Deployment user
PROD_DEPLOY_KEY         = Private SSH key for production
PROD_DEPLOY_HOST        = Production server IP/hostname
PROD_DEPLOY_USER        = Deployment user
SONAR_TOKEN             = SonarQube token (optional)
SLACK_WEBHOOK           = Slack webhook URL (optional)
```

### 2. Branch Protection

For `main` branch:
- ✅ Require status checks to pass before merging
- ✅ Require code review approval
- ✅ Dismiss stale PR reviews

For `develop` branch:
- ✅ Require status checks to pass

### 3. Deployment Keys

Generate SSH keys for CI/CD:

```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
```

Add public key to server `~/.ssh/authorized_keys`

### 4. Container Registry

GitHub automatically provides `ghcr.io` access via `GITHUB_TOKEN`

---

## WORKFLOW TRIGGERS

### On Push
```yaml
on:
  push:
    branches: [ main, develop ]
```

### On Pull Request
```yaml
on:
  pull_request:
    branches: [ main, develop ]
```

### Manual Trigger (optional)
```yaml
on:
  workflow_dispatch:
```

---

## MONITORING & DEBUGGING

### View Workflow Runs
- GitHub UI: Actions tab → CI/CD Pipeline
- Show current status, step logs, artifacts

### Failed Jobs
- Click job name
- Review step logs
- Download artifacts for debugging

### Test Coverage
- Codecov dashboard: `codecov.io`
- Coverage report archived: Actions → Artifacts

### Deployment Logs
- SSH into server: `ssh-i deploy_key user@host`
- Check Docker logs: `docker-compose logs`

---

## LOCAL DEVELOPMENT COMMANDS

### Before Committing

```bash
# Run all checks locally
cd Backend
php artisan test --coverage
./vendor/bin/phpstan analyse
./vendor/bin/pint

# Build frontend
cd ../Frontend
npm run build

# Git push
git push origin feature-branch
```

### Speedup Local Testing

```bash
# Run specific test file
php artisan test tests/Unit/Policies/ProductPolicyTest.php

# Run without coverage
php artisan test --no-coverage

# Parallel tests (if available)
php artisan test --parallel
```

---

## TROUBLESHOOTING

### Workflow Failed: "Database Connection Refused"
- Issue: MySQL not ready
- Solution: Workflows include health checks, increase wait time

### Workflow Failed: "Permission Denied on SSH"
- Issue: Deploy key not authorized
- Solution: Add public key to server `.ssh/authorized_keys`

### Docker Push Failed: "Unauthorized"
- Issue: GitHub token invalid
- Solution: Workflows use `${{ secrets.GITHUB_TOKEN }}` automatically

### Coverage Not Uploaded
- Issue: Codecov token missing
- Solution: Optional; local artifact uploaded regardless

### Staging/Prod Deploy Failed
- Issue: SSH credentials wrong
- Solution: Test SSH manually: `ssh -i deploy_key user@host`

---

## PERFORMANCE OPTIMIZATION

### Caching Strategy
- **Composer:** `~/.cache/composer`
- **npm:** `node_modules/` (cache key: package-lock.json)
- **Docker:** Multi-stage build with layer caching

### Parallel Jobs
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  build-frontend:
    runs-on: ubuntu-latest
  # All run in parallel
```

### Conditional Steps
```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

---

## SECURITY BEST PRACTICES

### Secrets Management
- ✅ Never commit secrets
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate keys regularly

### Branch Protection
- ✅ Require PR reviews
- ✅ Require status checks pass
- ✅ Protect main/develop branches

### Access Control
- ✅ Limited deploy user permissions
- ✅ SSH key-based auth only
- ✅ Separate staging/prod credentials

---

## NEXT PHASE

**PHASE 4:** Monitoring & Logging Setup
- Sentry error tracking
- Laravel logging
- Health check endpoints
- Queue monitoring
- Performance metrics

---

## PHASE 3 CHECKLIST

- ✅ GitHub Actions workflow created (7 jobs)
- ✅ Lint job (PHPStan + Pint)
- ✅ Test job (Unit + Feature + Coverage)
- ✅ Frontend build job
- ✅ Security scan job
- ✅ Docker build & push job
- ✅ Staging deployment job
- ✅ Production deployment job
- ✅ PHPStan configuration
- ✅ Pint configuration
- ✅ SonarQube configuration
- ✅ Setup instructions
- ✅ Troubleshooting guide

---

**Status:** ✅ COMPLETE  
**Created:** 2026-07-14T06:54:51.161Z

CI/CD pipeline is production-ready. Next: Setup monitoring & logging (PHASE 4).
