# 🚀 EchoSprite - Production Deployment Guide

This guide walks you through deploying the **production-ready** version of EchoSprite with PostgreSQL, security features, and monitoring.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ A [Render.com](https://render.com) account (free tier available)
- ✅ A GitHub account
- ✅ A Discord Developer Application (see [SETUP-DISCORD.md](SETUP-DISCORD.md))
- ✅ This repository pushed to GitHub

---

## Part 1: Set Up PostgreSQL Database on Render

### Step 1: Create PostgreSQL Instance

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `echosprite-db`
   - **Database**: `echosprite`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free** (for testing) or **Starter** (for production)
4. Click **"Create Database"**

### Step 2: Get Database Connection String

1. Wait for database to be created (~ 1 minute)
2. Click on your database
3. Scroll to **"Connections"**
4. Copy the **"Internal Database URL"** (starts with `postgresql://`)
5. **Save this URL** - you'll need it in the next section

---

## Part 2: Deploy Backend to Render

### Step 1: Create Web Service

1. On Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the `echosprite` repository
4. Configure:
   - **Name**: `echosprite` (this becomes `echosprite.onrender.com`)
   - **Root Directory**: `backend`
   - **Environment**: **Node**
   - **Region**: Same as database
   - **Branch**: `claude/echosprite-vtuber-mvp-01VymQDfvihSk6YELHNaYYnA` (or your main branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free** (for testing) or **Starter** (for production)

### Step 2: Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```bash
# Required Variables
DATABASE_URL=postgresql://user:pass@host:5432/echosprite  # From Step 2 above
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_REDIRECT_URI=https://echosprite.onrender.com/auth/discord/callback
FRONTEND_URL=https://rattusking.github.io/echosprite
SESSION_SECRET=generate_random_string_here

# Optional Variables
NODE_ENV=production
PORT=3000
WS_PORT=3001
CORS_ORIGINS=https://rattusking.github.io,https://echosprite.onrender.com
```

**Important Notes:**
- Replace `DATABASE_URL` with the Internal Database URL from Part 1
- Generate a random `SESSION_SECRET` (use https://randomkeygen.com/)
- Update `FRONTEND_URL` to match your GitHub Pages URL

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Wait for build to complete (~ 3-5 minutes)

---

## Part 3: Run Database Migrations

After your backend is deployed, you need to set up the database schema.

### Step 1: Access Render Shell

1. Go to your backend service on Render
2. Click **"Shell"** in the left sidebar
3. Wait for shell to connect

### Step 2: Run Migration

In the shell, run:

```bash
npm run migrate
```

You should see output like:

```
🚀 Starting database migrations...
📝 Running migration: 001_initial_schema.sql
✅ Migration completed successfully

📊 Database tables:
   - users
   - avatars
   - analytics
   - session
```

### Step 3: Verify Database

Still in the shell, test the database:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

You should see `0` rows (database is empty but tables exist).

---

## Part 4: Deploy Frontend to GitHub Pages

### Step 1: Update HTML Files with Utility Scripts

Ensure your HTML files include the new utility scripts. Add to `<head>` of `app-discord.html`, `login.html`, and other pages:

```html
<link rel="stylesheet" href="css/utils.css">
<script src="js/config.js"></script>
<script src="js/utils.js"></script>
```

### Step 2: Enable GitHub Pages

1. Go to: https://github.com/RattusKing/echosprite/settings/pages
2. Under **"Build and deployment"**:
   - **Source**: Deploy from a branch
   - **Branch**: `claude/echosprite-vtuber-mvp-01VymQDfvihSk6YELHNaYYnA`
   - **Folder**: `/frontend`
3. Click **"Save"**
4. Wait 2-3 minutes for deployment

### Step 3: Verify Frontend

Visit: https://rattusking.github.io/echosprite/

You should see the landing page.

---

## Part 5: Configure Discord Application

### Step 1: Update Redirect URI

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your EchoSprite application
3. Go to **OAuth2** → **General**
4. In **"Redirects"**, add:
   ```
   https://echosprite.onrender.com/auth/discord/callback
   ```
5. Click **"Save Changes"**

### Step 2: Verify Bot Invite

Make sure your Discord bot is invited to your server using the OAuth2 URL Generator:

1. **OAuth2** → **URL Generator**
2. **Scopes**: `bot`
3. **Bot Permissions**: Read Messages/View Channels, Connect
4. Copy URL and visit it to invite bot

---

## Part 6: Test Everything

### Test 1: Backend Health Check

Visit: https://echosprite.onrender.com/health

Expected response:
```json
{
  "status": "healthy",
  "version": "2.0.0-production",
  "database": "connected",
  "discord": {
    "bot": true,
    "oauth": true
  },
  "websocket": {
    "port": 3001,
    "connections": 0
  }
}
```

### Test 2: Discord Login Flow

1. Visit: https://rattusking.github.io/echosprite/
2. Click **"Login with Discord"**
3. Authorize the application
4. You should be redirected to the dashboard
5. Upload an avatar image
6. Verify it saves successfully

### Test 3: Voice Channel Integration

1. Join a Discord voice channel (in a server where your bot is present)
2. On EchoSprite dashboard, copy **Group URL**
3. Open URL in new tab
4. Your avatar should appear
5. Speak in voice → avatar should change to "talking" state
6. Mute/deafen → avatar should reflect state

### Test 4: OBS Integration

1. Open OBS Studio
2. Add **Browser Source**
3. URL: Your viewer URL (individual or group)
4. Width: 1920
5. Height: 1080
6. Check **"Shutdown source when not visible"**
7. Check **"Refresh browser when scene becomes active"**
8. Your avatar should appear in OBS

---

## Part 7: Monitoring and Maintenance

### View Logs

**Backend Logs:**
1. Go to Render → Your backend service
2. Click **"Logs"** in the left sidebar
3. Monitor for errors or warnings

**Error Log Files:**
Logs are stored in `backend/logs/` (on Render server):
- `error.log` - Errors only
- `combined.log` - All logs

### Monitor Database

1. Go to Render → Your PostgreSQL database
2. Click **"Metrics"**
3. Monitor:
   - Connection count
   - Query performance
   - Storage usage

### Check Analytics

Visit: https://echosprite.onrender.com/api/analytics/stats

This shows usage statistics (login events, uploads, etc.)

---

## Part 8: Scaling and Optimization

### Upgrade Plans (When Needed)

**Free Tier Limitations:**
- Backend spins down after 15 minutes of inactivity (cold starts)
- Database: 1GB storage, 97 connection limit
- No custom domains on free tier

**When to Upgrade:**
- More than 10-20 concurrent users → Upgrade backend to **Starter** ($7/month)
- Database running out of space → Upgrade to **Standard** ($7/month)
- Want custom domain → Upgrade backend

### Performance Optimization

Already implemented:
- ✅ PostgreSQL connection pooling (max 20 connections)
- ✅ Rate limiting (100 requests/15min per IP)
- ✅ Gzip compression
- ✅ Security headers (Helmet)
- ✅ Session storage in PostgreSQL
- ✅ WebSocket for real-time updates

---

## Part 9: Backup and Recovery

### Database Backups

**Automatic Backups (Render):**
- Free tier: No automatic backups
- Standard tier ($7/month): Daily backups, 7-day retention

**Manual Backup:**

```bash
# From your local machine (install PostgreSQL client first)
pg_dump -Fc --no-acl --no-owner -h [host] -U [user] -d [database] > echosprite-backup.dump
```

Replace `[host]`, `[user]`, `[database]` with values from Render database dashboard.

### Restore from Backup

```bash
pg_restore --clean --no-acl --no-owner -h [host] -U [user] -d [database] echosprite-backup.dump
```

---

## Part 10: Troubleshooting

### Backend won't start

**Check:**
1. Render logs for errors
2. All environment variables are set correctly
3. DATABASE_URL is valid
4. Discord tokens are correct

### Database connection fails

**Fix:**
1. Verify `DATABASE_URL` is the **Internal** URL (not External)
2. Check database is in same region as backend
3. Ensure migration was run successfully

### Discord login fails

**Fix:**
1. Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`
2. Check redirect URI matches exactly: `https://echosprite.onrender.com/auth/discord/callback`
3. Ensure Discord app has correct redirect configured

### Voice detection not working

**Fix:**
1. Verify bot is in the same server as your voice channel
2. Check bot has "Connect" permission
3. Ensure `DISCORD_BOT_TOKEN` is set correctly
4. Check Render logs for Discord bot connection status

### High latency / slow responses

**Fix:**
1. Upgrade from Free to Starter plan (eliminates cold starts)
2. Choose a Render region closer to your users
3. Check database query performance in logs

---

## Part 11: Security Checklist

Before going public, verify:

- ✅ `SESSION_SECRET` is a strong random string (not default)
- ✅ `NODE_ENV=production` is set
- ✅ All Discord tokens are kept secret (never commit to GitHub)
- ✅ CORS_ORIGINS only includes your domains
- ✅ Rate limiting is enabled (default: 100 req/15min)
- ✅ Helmet security headers are active
- ✅ Database uses SSL (automatic with Render PostgreSQL)
- ✅ HTTPS is enforced (automatic with Render)
- ✅ Input validation is enabled
- ✅ Terms of Service and Privacy Policy are published

---

## 🎉 You're Live!

Your EchoSprite instance is now running in production with:

- ✅ PostgreSQL database (persistent storage)
- ✅ Discord OAuth login
- ✅ Discord bot voice detection
- ✅ WebSocket real-time updates
- ✅ Rate limiting and security
- ✅ Error logging and monitoring
- ✅ Analytics tracking
- ✅ Professional legal pages

### Share Your Instance

**Landing Page:**
```
https://rattusking.github.io/echosprite/
```

**For VTubers:**
Tell them to:
1. Visit the landing page
2. Click "Login with Discord"
3. Upload their avatar images
4. Copy the viewer URL
5. Add to OBS as Browser Source

---

## 📞 Need Help?

- **Documentation**: [GitHub Repository](https://github.com/RattusKing/echosprite)
- **Discord Setup**: See [SETUP-DISCORD.md](SETUP-DISCORD.md)
- **Backend Health**: https://echosprite.onrender.com/health
- **Logs**: Render Dashboard → Logs

---

## 🔄 Continuous Deployment

Render automatically redeploys when you push to your branch. To update:

```bash
# Make changes to code
git add .
git commit -m "Update description"
git push

# Render will automatically detect and redeploy
```

---

## 📊 Monitoring Checklist

Weekly checks:

- [ ] Visit `/health` endpoint - ensure "status": "healthy"
- [ ] Check Render logs for errors
- [ ] Verify database storage usage
- [ ] Review analytics for unusual activity
- [ ] Test Discord login flow
- [ ] Test voice channel integration

---

**Congratulations! EchoSprite is production-ready and deployed.** 🚀
