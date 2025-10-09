# Database Setup Instructions

## Problem
You're getting a "Configuration" error (500) when trying to sign up because the database connection isn't working.

Current DATABASE_URL in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/levelup_db
```

This is a placeholder and won't work. You need a real PostgreSQL database.

## Solution: Use Neon (Free PostgreSQL Hosting)

### Step 1: Create a Neon Account
1. Go to https://neon.tech
2. Click "Sign Up" (free tier available)
3. Sign in with GitHub or Google

### Step 2: Create a New Project
1. Click "Create a project"
2. Give it a name (e.g., "levelup-app")
3. Select a region close to you
4. Click "Create project"

### Step 3: Get Your Connection String
1. After creating the project, you'll see a connection string
2. It will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Copy this entire string

### Step 4: Update Your .env File
Replace the DATABASE_URL in `E:\Workspace\LevelUp-App\web\.env`:

```env
# Before:
DATABASE_URL=postgresql://user:password@localhost:5432/levelup_db

# After (use your actual connection string from Neon):
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Step 5: Create Database Tables
The app needs specific tables to work. Check if there's a schema file or migration:
- Look for files like `schema.sql`, `migrations/`, or database setup scripts
- Run the migrations to create the necessary tables:
  - `auth_users`
  - `auth_accounts`
  - `auth_sessions`
  - `auth_verification_token`

### Step 6: Restart Your Dev Server
1. Stop the dev server (Ctrl+C)
2. Run `npm run dev` again
3. Try signing up - it should work now!

## Alternative: Local PostgreSQL

If you prefer running PostgreSQL locally:

1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database and User**
   ```sql
   createdb levelup_db
   psql levelup_db
   CREATE USER levelup_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE levelup_db TO levelup_user;
   ```

3. **Update .env**
   ```
   DATABASE_URL=postgresql://levelup_user:your_secure_password@localhost:5432/levelup_db
   ```

4. **Run migrations** to create tables

## Verify Connection
After updating DATABASE_URL, you can test the connection by trying to sign up again. If you still get errors, check the server console for specific database error messages.
