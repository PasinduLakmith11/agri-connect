# 🔧 Database Setup Instructions

## Current Issue
The login is failing with "Access Denied - Failed query" because the database tables don't exist or the connection has issues.

## Solution: Create Database Tables in Supabase

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **agri-connect** (or the project with ID: aogrqxaamdbaxiiettim)

### Step 2: Verify Project is Active
- Check if the project status shows "Active" (green indicator)
- If paused or inactive, click "Resume" or "Restore"

### Step 3: Run the Database Schema
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click the **"+ New Query"** button
3. Open the file: `backend/supabase_schema.sql` on your local machine
4. **Copy the ENTIRE contents** of that file (all 241 lines)
5. **Paste** it into the SQL Editor in Supabase
6. Click the **"Run"** button (or press `Ctrl+Enter`)
7. Wait for the success message: ✅ Database schema created successfully!

### Step 4: Verify Tables Were Created
After running the schema, verify the tables exist:
1. In Supabase dashboard, go to **"Table Editor"** (left sidebar)
2. You should see these tables:
   - users
   - products
   - orders
   - routes
   - route_orders
   - notifications  
   - price_history
   - sms_logs

### Step 5: Test the Connection
Back in your terminal, run:
```bash
npm run db-test
```

You should see:
✅ Connection successful!
✅ "users" table exists

## Alternative: If Connection Still Fails

### Check IP Allowlist
1. In Supabase dashboard, go to: **Settings** → **Database**
2. Scroll to **"Connection Pooling"** section
3. Under **"Pooler Configuration"** → **"Connection Restrictions"**
4. Ensure "Allow connections from any IP" is enabled, OR
5. Add your current IP address to the allowlist

### Get Fresh Connection String
If the above doesn't work, your DATABASE_URL might be outdated:
1. In Supabase dashboard, go to: **Settings** → **Database**
2. Scroll to **"Connection string"** section
3. Select the **"Connection Pooling"** tab
4. Mode: **Transaction**
5. Copy the connection string
6. Update your `backend/.env` file:
   ```
   DATABASE_URL="<paste-new-connection-string-here>"
   ```
7. Replace `[YOUR-PASSWORD]` in the connection string with your actual database password

### Restart Backend Server
After making any changes:
```bash
# Stop the current backend server (Ctrl+C in its terminal)
npm run dev
```

## Final Test
Once tables are created, try logging in again with:
- Email: vijith@gmail.com
- Password: (your password)

The "Access Denied - Failed query" error should be resolved! ✅
