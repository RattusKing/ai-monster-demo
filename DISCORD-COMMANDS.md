# 🎮 EchoSprite Discord Slash Commands

EchoSprite now includes **Discord slash commands** so you can manage your avatar directly from Discord without visiting the website!

**Key Feature:** Commands configure your avatar, but the output still works in **OBS/Twitch/YouTube** - you get the best of both worlds!

---

## 🚀 Quick Start

### 1. Register Commands (One-Time Setup)

After deploying your backend with the bot token, register the slash commands:

#### **On Render:**
1. Go to your backend service on Render
2. Click **"Shell"** in the left sidebar
3. Run:
   ```bash
   npm run register-commands
   ```
4. Wait for confirmation (takes 5-10 seconds)

#### **Locally (for testing):**
```bash
cd backend
npm run register-commands
```

**Note:** Commands take up to **1 hour** to appear globally. For instant testing, use guild-specific registration:
```bash
npm run register-commands guild YOUR_GUILD_ID
```

### 2. Invite Bot to Your Server

Make sure your bot is invited with proper permissions:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application → **OAuth2** → **URL Generator**
3. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
4. Select permissions:
   - ✅ View Channels
   - ✅ Connect
5. Visit the generated URL to invite

### 3. Use Commands in Discord!

Type `/` in any Discord channel and you'll see EchoSprite commands!

---

## 📋 Available Commands

### **🎨 Avatar Commands**

#### `/avatar upload`
Upload your avatar images directly from Discord.

**Options:**
- `idle` (required) - Idle state image
- `talking` (required) - Talking state image
- `muted` (optional) - Muted state image
- `deafened` (optional) - Deafened state image

**Example:**
```
/avatar upload idle:[attach idle.png] talking:[attach talking.png]
```

**Response:**
- ✅ Confirmation of upload
- 🔗 Individual viewer URL for OBS
- 💡 Instructions for adding to OBS

---

#### `/avatar view`
View your current avatar configuration.

**Response:**
- Current avatar states (✅ uploaded, ❌ not uploaded)
- Settings
- Last updated time

---

#### `/avatar url`
Get your OBS browser source URLs.

**Response:**
- Individual viewer URL
- OBS settings (width, height, FPS)
- Setup instructions

---

#### `/avatar delete`
Delete your avatar configuration permanently.

**Warning:** This cannot be undone!

---

### **👥 Channel Commands**

#### `/channel url`
Get group viewer URL for your current voice channel.

**Must be in a voice channel to use this command.**

**Response:**
- Group viewer URL showing all members in your voice channel
- OBS settings
- Real-time update info

**Perfect for collaborations!**

---

#### `/channel preview`
Preview all members currently in your voice channel.

**Response:**
- List of members with their current states:
  - 🎤 Active (speaking)
  - 🔇 Muted
  - 🔕 Deafened
  - 📹 Streaming

---

#### `/channel members`
Alias for `/channel preview` - shows all members in voice.

---

### **⚙️ Settings Commands**

#### `/settings view`
View your current avatar settings.

**Response:**
- Animations (bounce, fade)
- Group view settings
- Spacing
- All configuration options

---

#### `/settings bounce <enabled>`
Toggle bounce animation for your avatar.

**Options:**
- `enabled` - `true` or `false`

**Example:**
```
/settings bounce enabled:true
```

---

#### `/settings fade <enabled>`
Toggle fade effect when switching states.

**Options:**
- `enabled` - `true` or `false`

---

#### `/settings spacing <value>`
Set avatar spacing in group view (0-100 pixels).

**Options:**
- `value` - Number between 0 and 100

**Example:**
```
/settings spacing value:30
```

---

#### `/settings show-names <enabled>`
Toggle username display in group view.

**Options:**
- `enabled` - `true` or `false`

---

#### `/settings include-self <enabled>`
Include or exclude yourself in group viewer.

**Options:**
- `enabled` - `true` or `false`

**Use case:** Exclude yourself if you only want to show collaborators.

---

#### `/settings dim-inactive <enabled>`
Dim avatars of members who aren't talking.

**Options:**
- `enabled` - `true` or `false`

---

### **🔧 Utility Commands**

#### `/help`
Display help information about all commands.

**Response:**
- Full command list
- Web dashboard link
- Documentation links

---

#### `/status`
Check EchoSprite bot and service status.

**Response:**
- Bot status (online/offline)
- Backend API status
- Database connection
- WebSocket connections
- Current version

---

## 🎯 Typical Workflow

### **For Solo Streaming:**

1. Upload avatar from Discord:
   ```
   /avatar upload idle:[file] talking:[file] muted:[file] deafened:[file]
   ```

2. Get your OBS URL:
   ```
   /avatar url
   ```

3. Copy the URL and add to OBS as Browser Source

4. Configure settings if needed:
   ```
   /settings bounce enabled:true
   /settings fade enabled:true
   ```

5. Join Discord voice and start streaming!

---

### **For Collaboration Streams:**

1. Everyone uploads their avatars:
   ```
   /avatar upload idle:[file] talking:[file]
   ```

2. Join the same Discord voice channel

3. One person gets the group URL:
   ```
   /channel url
   ```

4. Share URL with collaborators

5. Everyone adds the same URL to their OBS

6. All avatars appear together, react in real-time!

---

## 🔗 URLs Generated by Commands

### **Individual Viewer URL:**
```
https://rattusking.github.io/echosprite/viewer.html?userId=YOUR_DISCORD_ID&mode=discord
```

**What it shows:**
- Only your avatar
- Changes based on voice state (talking, muted, deafened)
- Perfect for solo streaming

### **Group Viewer URL:**
```
https://rattusking.github.io/echosprite/viewer-group.html?channelId=VOICE_CHANNEL_ID
```

**What it shows:**
- All avatars in the voice channel
- Real-time join/leave updates
- State changes for everyone
- Perfect for collabs

---

## ⚙️ OBS Browser Source Settings

When adding URLs to OBS:

1. **Source** → **Browser**
2. **URL:** Paste the URL from Discord command
3. **Width:** 1920
4. **Height:** 1080
5. **FPS:** 30
6. **Custom CSS:** (optional for positioning)
7. ✅ **Shutdown source when not visible**
8. ✅ **Refresh browser when scene becomes active**

---

## 🛠️ Administration

### **Register Commands Globally:**
```bash
npm run register-commands
```
Commands appear in all servers (takes up to 1 hour)

### **Register Commands to Specific Guild (Instant):**
```bash
npm run register-commands guild 123456789012345678
```
Replace with your server's Guild ID (instant, but only in that server)

### **Delete All Commands:**
```bash
npm run register-commands delete
```
Removes all registered slash commands

### **Find Guild ID:**
1. Enable Developer Mode in Discord (User Settings → Advanced)
2. Right-click your server icon
3. Click "Copy ID"

---

## 🆚 Discord Commands vs. Web Dashboard

| Feature | Discord Commands | Web Dashboard |
|---------|------------------|---------------|
| Upload avatars | ✅ `/avatar upload` | ✅ app-discord.html |
| Get OBS URLs | ✅ `/avatar url` | ✅ Copy from dashboard |
| Configure settings | ✅ `/settings` commands | ✅ Settings panel |
| View current config | ✅ `/avatar view` | ✅ Dashboard preview |
| Convenience | ✅ Never leave Discord | ⚠️ Have to visit site |
| Visual preview | ❌ No preview | ✅ Live preview |
| Drag & drop upload | ❌ Attachment picker | ✅ Drag & drop |

**Recommendation:** Use whichever you prefer! Both methods save to the same database and generate the same URLs.

---

## 🐛 Troubleshooting

### **Commands not appearing**

**Solution:**
1. Verify bot has `applications.commands` scope
2. Re-invite bot with updated permissions
3. Wait up to 1 hour for global commands
4. Use guild-specific registration for instant testing

### **"Interaction failed" error**

**Possible causes:**
1. Backend is not running
2. Database not connected
3. Missing environment variables
4. Backend timeout (check Render logs)

**Fix:**
- Check `/status` command for backend health
- Verify Render backend is running
- Check environment variables are set

### **"You haven't uploaded an avatar" message**

**Solution:**
- Use `/avatar upload` to upload your avatar first
- Or visit web dashboard to upload

### **"Not in voice channel" error**

**Solution:**
- Join a Discord voice channel first
- Ensure bot is in the same server as the voice channel

### **Image upload fails**

**Common issues:**
1. File too large (max 10MB per image)
2. Invalid file type (must be PNG, JPEG, GIF, or WebP)
3. Discord attachment expired (upload again)

**Solution:**
- Compress images if too large
- Convert to PNG or JPEG
- Re-upload fresh attachments

---

## 📊 Analytics

All slash command usage is tracked in analytics:

- Command usage counts
- Upload activity
- Settings changes

View stats at: `https://echosprite.onrender.com/api/analytics/stats`

---

## 🎉 Advanced Tips

### **Tip 1: Quick Setup Macro**
Create a Discord text snippet for new VTubers:
```
1. /avatar upload (upload your 4 images)
2. /avatar url (get your OBS link)
3. Add link to OBS as Browser Source (1920x1080)
4. Join voice and test!
```

### **Tip 2: Group Coordination**
For collaborations, share this in chat:
```
Everyone:
1. /avatar upload (your images)
2. Join voice channel
Then I'll share the group URL!
```

### **Tip 3: Settings Profiles**
Save your favorite settings:
```
Bouncy mode:
/settings bounce enabled:true
/settings spacing value:40

Minimal mode:
/settings bounce enabled:false
/settings dim-inactive enabled:true
/settings spacing value:20
```

---

## 🔄 Updating Commands

When you update command code:

1. Make code changes
2. Commit and push to GitHub
3. Render auto-redeploys backend
4. Re-run command registration:
   ```bash
   npm run register-commands
   ```
5. Commands update globally within 1 hour

For immediate testing, use guild-specific registration.

---

## 🌟 Why This Is Awesome

**Before (Web Only):**
1. VTuber visits website
2. Logs in with Discord
3. Uploads avatars
4. Copies URL
5. Adds to OBS

**Now (Discord Commands):**
1. VTuber types `/avatar upload` in Discord
2. Bot DMs the OBS URL
3. Add to OBS
4. Done!

**Still works with:**
- ✅ OBS Studio
- ✅ Twitch streaming
- ✅ YouTube streaming
- ✅ Any streaming software with browser sources

---

## 📞 Need Help?

- **Documentation:** [GitHub Repo](https://github.com/RattusKing/echosprite)
- **Setup Guide:** [SETUP-DISCORD.md](SETUP-DISCORD.md)
- **Deployment:** [PRODUCTION-DEPLOY.md](PRODUCTION-DEPLOY.md)
- **Check Status:** Use `/status` command in Discord

---

**Congratulations! You now have a professional Discord bot interface for EchoSprite!** 🎉

Commands make avatar management super convenient while still outputting to OBS for Twitch/YouTube streaming.
