# 🚨 CRITICAL: Database Connection Fix Required

Your development environment cannot connect to the database because your network uses IPv4, but the direct database address is IPv6-only. You MUST use the **Connection Pooler** (IPv4 compatible).

## ✅ The Easiest Way to Fix (Use "Connect" Button)

1.  **Look at the top of your Supabase Dashboard.**
2.  Click the **"Connect"** button (near the search bar).
    *(As seen in your screenshot, it's a white button at the top).*
3.  In the popup that appears:
    - Look for **"Connection Pooling"** or **"Transaction Mode"**.
    - If you see tabs like "URI" | "PSQL", ensure "Use connection pooler" is checked.
    - **Mode:** Select **Transaction**.
4.  **Copy the URI.**
    - It should look like: `postgres://postgres.aogrqxaamdbaxiiettim:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
    - **Verify:** The port must be **6543**. The domain must contain **pooler**.

5.  **Update your `.env` file**:
    - Open `d:\agri\agri-connect\backend\.env`
    - Replace `DATABASE_URL` with the bold text you copied.
    - **Important:** Replace `[YOUR-PASSWORD]` with your actual password: `Pasindu@!2000`
      *(If it fails, try the URL-encoded version: `Pasindu%40%212000`)*

## 🔍 Trouble Finding It?
If the "Connect" button doesn't show the Pooler:
1.  Go to **Settings** (Cog icon).
2.  Click **"Infrastructure"** (since "Database" is missing in your sidebar).
3.  Look for Connection Pooling there.
    *(Supabase sometimes moves these settings).*

## 🚀 After Updating
1.  Save `.env`.
2.  Restart backend: `Ctrl+C` then `npm run dev`.
3.  Test: `npx tsx src/scripts/test-db.ts`
