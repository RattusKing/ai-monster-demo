# 🎮 Discord Setup Guide for EchoSprite

This guide will walk you through setting up Discord integration for EchoSprite.

## 📋 What You'll Need

- A Discord account
- Access to the Discord Developer Portal
- Your deployed backend URL (Render)

---

## Part 1: Create Discord Application

### Step 1: Go to Discord Developer Portal

Visit: https://discord.com/developers/applications

### Step 2: Create New Application

1. Click **"New Application"** button (top right)
2. Name it: `EchoSprite` (or whatever you want)
3. Click **"Create"**

### Step 3: Get OAuth2 Credentials

1. Click **"OAuth2"** in the left sidebar
2. Click **"General"**
3. Copy your **Client ID** → Save this
4. Copy your **Client Secret** → Save this (click "Reset Secret" if needed)

### Step 4: Add Redirect URL

1. Still in OAuth2 settings
2. Scroll to **"Redirects"**
3. Click **"Add Redirect"**
4. Add: `https://ai-monster-demo.onrender.com/auth/discord/callback`
5. Click **"Save Changes"**

---

## Part 2: Create Discord Bot

### Step 1: Enable Bot

1. Click **"Bot"** in the left sidebar
2. Click **"Reset Token"** button
3. Copy the token → **Save this securely!** (You won't see it again)
4. This is your `DISCORD_BOT_TOKEN`

### Step 2: Enable Privileged Intents

Scroll down to **"Privileged Gateway Intents"**

Enable these:
- ✅ **SERVER MEMBERS INTENT**
- ✅ **PRESENCE INTENT** (optional)
- ✅ **MESSAGE CONTENT INTENT** (optional)

Click **"Save Changes"**

### Step 3: Invite Bot to Your Server

1. Click **"OAuth2"** → **"URL Generator"**
2. Select these scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select these permissions:
   - ✅ Read Messages/View Channels
   - ✅ Connect (for voice)
   - ✅ Speak (optional)
4. Copy the generated URL at the bottom
5. Paste it in your browser
6. Select your Discord server
7. Click **"Authorize"**

---

## Part 3: Configure Backend Environment Variables

### On Render Dashboard:

1. Go to your backend service on Render
2. Click **"Environment"** in the left sidebar
3. Add these environment variables:

```
DISCORD_CLIENT_ID=paste_your_client_id_here
DISCORD_CLIENT_SECRET=paste_your_client_secret_here
DISCORD_REDIRECT_URI=https://ai-monster-demo.onrender.com/auth/discord/callback
DISCORD_BOT_TOKEN=paste_your_bot_token_here
SESSION_SECRET=generate_a_random_string_here
FRONTEND_URL=https://rattusking.github.io/ai-monster-demo
```

4. Click **"Save Changes"**
5. Your backend will automatically redeploy

---

## Part 4: Test Everything

### Test 1: Check Health Endpoint

Visit: `https://ai-monster-demo.onrender.com/health`

You should see:
```json
{
  "status": "healthy",
  "discord": {
    "bot": true,
    "oauth": true
  }
}
```

### Test 2: Test Discord Login

1. Visit your frontend: `https://rattusking.github.io/ai-monster-demo/`
2. Click "Login with Discord"
3. You should be redirected to Discord
4. Authorize the app
5. You should be redirected back to your dashboard

### Test 3: Join Voice Channel

1. Join a Discord voice channel in a server where your bot is present
2. The bot should detect you're in voice
3. Your avatar should appear when you speak

---

## ✅ Configuration Complete!

Your EchoSprite is now fully configured with Discord integration!

### Features Now Available:

- ✅ Discord OAuth login
- ✅ 4 avatar states (idle, talking, muted, deafened)
- ✅ Real-time voice detection via Discord bot
- ✅ Group viewing (see everyone in your voice channel)
- ✅ Individual viewer URLs
- ✅ WebSocket real-time updates

---

## 🐛 Troubleshooting

### Bot shows offline in Discord

- Check that `DISCORD_BOT_TOKEN` is correctly set in Render
- Check Render logs for any bot connection errors
- Make sure Privileged Gateway Intents are enabled

### OAuth login fails

- Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
- Check that redirect URI matches exactly in both Discord and Render
- Make sure your frontend URL is correct in `FRONTEND_URL`

### Voice detection not working

- Ensure bot is in the same server as your voice channel
- Check that bot has "Connect" permission
- Verify Privileged Gateway Intents are enabled
- Check Render logs for WebSocket errors

---

## 📞 Need Help?

- Check Render logs: `Logs` tab in Render dashboard
- Test endpoints manually with curl/Postman
- Verify all environment variables are set correctly
