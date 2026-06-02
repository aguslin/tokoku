# Vercel + Neon Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (https://vercel.com)
- Neon account (https://neon.tech)

## Step 1: Create Neon Database
1. Go to https://console.neon.tech and sign up/login
2. Click "Create Project"
3. Name it "marketplace-v2"
4. Select a region closest to your users
5. Click "Create Project"
6. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

## Step 2: Run Migrations on Neon
1. Set the DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Run migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```
4. Run seeders (optional, for sample data):
   ```bash
   npx sequelize-cli db:seed:all
   ```

## Step 3: Deploy to Vercel
1. Push your code to GitHub
2. Go to https://vercel.com and import your repository
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next
4. Add environment variables:
   - `DATABASE_URL` = your Neon connection string
   - `JWT_SECRET` = a secure random string
   - `JWT_REFRESH_SECRET` = another secure random string
   - `JWT_EXPIRES_IN` = 15m
   - `JWT_REFRESH_EXPIRES_IN` = 7d
   - `NODE_ENV` = production
5. Click "Deploy"

## Step 4: Configure Custom Domain (Optional)
1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

## Local Development

### Option A: With Local PostgreSQL
1. Install PostgreSQL locally or use Docker:
   ```bash
   docker-compose up -d db redis
   ```
2. Copy `.env.example` to `.env` in the backend directory
3. Update the database credentials
4. Run migrations:
   ```bash
   cd backend && npx sequelize-cli db:migrate
   ```
5. Start the backend:
   ```bash
   cd backend && npm run dev
   ```
6. Start the frontend:
   ```bash
   npm run dev
   ```

### Option B: With Neon (Cloud Database)
1. Create a Neon project (see Step 1)
2. Set DATABASE_URL in backend/.env
3. Run migrations:
   ```bash
   cd backend && DATABASE_URL="your-neon-url" npx sequelize-cli db:migrate
   ```
4. Start backend and frontend as above

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | Neon PostgreSQL connection string | Yes (production) |
| DB_HOST | Database host | Yes (dev without DATABASE_URL) |
| DB_PORT | Database port | No (default: 5432) |
| DB_NAME | Database name | Yes (dev without DATABASE_URL) |
| DB_USER | Database user | Yes (dev without DATABASE_URL) |
| DB_PASSWORD | Database password | Yes (dev without DATABASE_URL) |
| JWT_SECRET | JWT access token secret | Yes |
| JWT_REFRESH_SECRET | JWT refresh token secret | Yes |
| JWT_EXPIRES_IN | Access token expiry | No (default: 15m) |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | No (default: 7d) |
| REDIS_URL | Redis connection URL | No (optional) |
| CORS_ORIGIN | Allowed CORS origins | No |
| UPLOAD_DIR | File upload directory | No |
