# 🎮 EchoSprite - Complete Streamer Guide

## 📖 Table of Contents
- [What is EchoSprite?](#what-is-echosprite)
- [What Does It Do?](#what-does-it-do)
- [How Does It Work?](#how-does-it-work)
- [Quick Start Guide](#quick-start-guide)
- [Setting Up in OBS](#setting-up-in-obs)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## 🎭 What is EchoSprite?

**EchoSprite** is a **FREE VTuber avatar tool** that automatically reacts to your Discord voice state. It displays different avatar images based on whether you're talking, muted, or deafened in Discord voice channels.

**Perfect for:**
- 🎮 Gamers who stream on Twitch/YouTube
- 🎙️ Podcasters using Discord
- 👥 Content creators who want a reactive avatar
- 💬 Community streamers doing watch parties

**No downloads. No software. Just Discord + OBS.**

---

## ✨ What Does It Do?

EchoSprite gives you a **reactive avatar** that changes automatically:

### **4 Avatar States:**

| State | When It Shows | Example Use |
|-------|--------------|-------------|
| 💤 **Idle** | You're in voice but silent | Default resting pose |
| 🗣️ **Talking** | You're speaking in Discord | Mouth open, animated |
| 🔇 **Muted** | You muted your mic | Hand over mouth, "shh" pose |
| 🔕 **Deafened** | You deafened yourself | Headphones off, eyes closed |

### **Key Features:**

✅ **Instant reactions** - Changes state in real-time as you talk
✅ **Multiple profiles** - Switch between different themes/outfits (up to 20!)
✅ **Group viewing** - Share one avatar URL with your whole Discord server
✅ **OBS compatible** - Works as a Browser Source
✅ **Free forever** - No subscriptions, no fees
✅ **Discord-powered** - No extra software to install

---

## 🔧 How Does It Work?

### **Simple 3-Step Flow:**

```
1. YOU upload avatar images via Discord bot
         ↓
2. EchoSprite gives you a URL
         ↓
3. YOU add that URL to OBS as a Browser Source
         ↓
4. Avatar reacts automatically when you talk in Discord!
```

### **Technical Details (For The Curious):**

1. **Discord Bot** monitors your voice state in real-time
2. **Backend server** stores your avatar images securely
3. **Frontend webpage** displays the correct image based on your state
4. **WebSocket connection** updates instantly (no lag!)
5. **OBS Browser Source** embeds the webpage in your stream

**You don't need to run anything!** The bot is hosted on Render, the frontend is on GitHub Pages, and the database is PostgreSQL. Just use Discord commands and copy the URL into OBS.

---

## 🚀 Quick Start Guide

### **Step 1: Add EchoSprite Bot to Your Discord Server**

1. Click this invite link: `[INSERT YOUR OAUTH2 URL HERE]`
2. Select which Discord server to add it to
3. Click **"Authorize"**
4. Complete the CAPTCHA
5. ✅ Bot is now in your server!

---

### **Step 2: Upload Your Avatar Images**

You need **4 images** (one for each state). These can be:
- 🎨 Custom artwork you commissioned
- 📸 Photos of yourself with different expressions
- 🖼️ Edited images/memes
- 🎭 Anime-style character art

**Image Requirements:**
- Format: PNG (with transparency recommended), JPG, or GIF
- Size: Under 10MB each
- Dimensions: Any size (1080x1080 recommended)
- **Pro Tip:** Use transparent PNGs so your avatar floats over your stream!

**Upload Command:**

In your Discord server, type:
```
/avatar upload
```

The bot will guide you through uploading all 4 images:
1. **Idle image** - Your default resting pose
2. **Talking image** - When you're speaking
3. **Muted image** - When mic is muted
4. **Deafened image** - When you're deafened

**Example:**
```
/avatar upload
Bot: "Please upload your IDLE image"
[You attach idle.png]
Bot: "Please upload your TALKING image"
[You attach talking.png]
... and so on
```

✅ After uploading, the bot gives you your **personal avatar URL**!

---

### **Step 3: Get Your Avatar URL**

After uploading, type:
```
/avatar view
```

You'll get a URL that looks like:
```
https://rattusking.github.io/echosprite/viewer.html?userId=YOUR_DISCORD_ID&mode=discord
```

**Copy this URL** - you'll need it for OBS!

---

### **Step 4: Add to OBS (Open Broadcaster Software)**

1. **Open OBS Studio**
2. **Add a Browser Source:**
   - Right-click in "Sources" panel
   - Click **"Add" → "Browser"**
   - Name it: `EchoSprite Avatar`
3. **Configure the Browser Source:**
   - **URL:** Paste your avatar URL from Step 3
   - **Width:** `1080` (or your avatar size)
   - **Height:** `1080`
   - **FPS:** `30`
   - ✅ Check **"Shutdown source when not visible"**
   - ✅ Check **"Refresh browser when scene becomes active"**
   - Click **"OK"**
4. **Position Your Avatar:**
   - Resize and drag it to your preferred corner
   - Use the red bounding box to adjust size

✅ **Done!** Your avatar will now react when you talk in Discord!

---

## 🎨 Advanced Features

### **1. Multiple Profiles (Themes/Outfits)**

You can create up to **20 different avatar profiles** - perfect for:
- 🎃 Seasonal themes (Halloween, Christmas, etc.)
- 🎮 Different games (FPS outfit, RPG outfit, etc.)
- 🎭 Different moods (Casual, Formal, Silly)
- 📅 Special events

**Create a New Profile:**
```
/profile create name:"Gaming Mode"
```

**Upload Images to That Profile:**
```
/profile upload profile:"Gaming Mode"
```

**Switch Active Profile:**
```
/profile switch profile:"Gaming Mode"
```

**View All Your Profiles:**
```
/profile list
```

**Using Profile-Specific URLs in OBS:**

You can create multiple OBS scenes with different profile URLs:

- **Scene 1 (Gaming):** `viewer.html?userId=YOUR_ID&profile=gaming-mode`
- **Scene 2 (Casual):** `viewer.html?userId=YOUR_ID&profile=casual`
- **Scene 3 (Holiday):** `viewer.html?userId=YOUR_ID&profile=christmas`

Switch OBS scenes to switch avatars instantly!

---

### **2. Group Viewing (One Avatar for Whole Server)**

Instead of everyone adding their own avatar, share **one URL** that shows whoever is actively talking:

**Create a Channel Viewer:**
```
/channel create
```

This creates a URL like:
```
https://rattusking.github.io/echosprite/viewer.html?channelId=YOUR_VOICE_CHANNEL_ID
```

**How It Works:**
- When **Person A** talks → Shows Person A's avatar
- When **Person B** talks → Shows Person B's avatar
- Switches automatically!

**Perfect for:**
- 🎙️ Podcast groups
- 🎮 Gaming squads
- 👥 Watch parties

**OBS Setup:**
- Add this channel URL as a Browser Source (same as Step 4 above)
- Position it where you want the "active speaker" to appear

---

### **3. Individual User Viewing**

You can view **anyone's avatar** (if they've uploaded one):

**Get Someone Else's Avatar URL:**
```
/avatar view @username
```

This lets you:
- 👀 Preview someone's avatar before using it
- 🎬 Create multi-person stream layouts
- 📺 Build custom "talking heads" panels

---

## 🛠️ All Available Commands

### **Avatar Management**
| Command | Description |
|---------|-------------|
| `/avatar upload` | Upload your 4 avatar images |
| `/avatar view` | Get your avatar URL |
| `/avatar view @user` | View someone else's avatar |
| `/avatar delete` | Delete your avatar permanently |

### **Profile Management**
| Command | Description |
|---------|-------------|
| `/profile create name:"Profile Name"` | Create a new profile/theme |
| `/profile upload profile:"Name"` | Upload images to a specific profile |
| `/profile list` | See all your profiles |
| `/profile switch profile:"Name"` | Switch your active profile |
| `/profile url profile:"Name"` | Get URL for a specific profile |
| `/profile delete profile:"Name"` | Delete a profile |
| `/profile rename old:"Old" new:"New"` | Rename a profile |

### **Channel Management**
| Command | Description |
|---------|-------------|
| `/channel create` | Create group viewer for current voice channel |
| `/channel view` | Get URL for current channel |
| `/channel delete` | Remove channel viewer |

### **Settings**
| Command | Description |
|---------|-------------|
| `/settings view` | See your current settings |
| `/settings theme` | Change viewer theme (dark/light) |

### **Help**
| Command | Description |
|---------|-------------|
| `/help` | Get help with commands |
| `/status` | Check if bot is working |

---

## 🎥 Setting Up in OBS - Detailed Guide

### **Method 1: Basic Setup (Single Avatar)**

**Best for:** Solo streamers who want one reactive avatar

1. Get your avatar URL: `/avatar view`
2. In OBS: **Sources → Add → Browser**
3. Settings:
   - **URL:** `https://rattusking.github.io/echosprite/viewer.html?userId=YOUR_ID&mode=discord`
   - **Width:** `1080`
   - **Height:** `1080`
   - **FPS:** `30`
   - ✅ **Shutdown source when not visible**
   - ✅ **Refresh browser when scene becomes active**
4. Click **OK**
5. Resize/position as needed

**Result:** Avatar appears and reacts when you talk!

---

### **Method 2: Multiple Profiles (Scene-Based Switching)**

**Best for:** Streamers who want different avatars for different games/moods

**Setup:**

1. Create 3 profiles:
   ```
   /profile create name:"Gaming"
   /profile upload profile:"Gaming"

   /profile create name:"Casual"
   /profile upload profile:"Casual"

   /profile create name:"Spooky"
   /profile upload profile:"Spooky"
   ```

2. Create 3 OBS scenes:
   - **Scene: FPS Games** → Browser Source with `?profile=gaming`
   - **Scene: Just Chatting** → Browser Source with `?profile=casual`
   - **Scene: Horror Games** → Browser Source with `?profile=spooky`

3. Switch scenes = Switch avatars instantly!

---

### **Method 3: Group Panel (Multiple People)**

**Best for:** Podcasts, co-op streams, watch parties

**Setup:**

1. Join your voice channel
2. Type: `/channel create`
3. Copy the channel URL
4. In OBS: Add Browser Source with that URL
5. Settings: Width `400`, Height `400` (smaller since multiple people)

**Result:** Shows whoever is currently talking!

**Advanced:** Create multiple Browser Sources for each co-host:
- **Source 1:** `viewer.html?userId=HOST_1_ID` (top-left corner)
- **Source 2:** `viewer.html?userId=HOST_2_ID` (top-right corner)
- **Source 3:** `viewer.html?userId=HOST_3_ID` (bottom-left corner)

All avatars react independently!

---

### **Method 4: Advanced Layout (Picture-in-Picture)**

**Best for:** Professional streams with custom overlays

**Setup:**

1. Create a scene with:
   - **Background:** Your game capture / camera
   - **Overlay:** Your custom frame/border PNG
   - **Avatar:** EchoSprite Browser Source (positioned inside the frame)
   - **Labels:** Text sources for your name/socials

2. Layer order (bottom to top):
   - Background
   - Avatar (EchoSprite)
   - Frame/Overlay
   - Text labels

3. Resize avatar to fit perfectly in your frame

**Result:** Professional-looking reactive avatar integrated into your custom overlay!

---

## 🎨 Avatar Creation Tips

### **What Makes a Good Avatar?**

✅ **Clear facial expressions** - Make the difference between idle/talking obvious
✅ **Transparent backgrounds** - Use PNG with alpha channel so avatar floats
✅ **Consistent style** - All 4 images should match in art style/size
✅ **Expressive muted/deafened states** - Make these fun (hand over mouth, headphones off, etc.)
✅ **High resolution** - 1080x1080 or larger for crisp quality

### **Example Avatar Ideas:**

**Option 1: Anime Character**
- Idle: Neutral smile, eyes forward
- Talking: Mouth open, excited expression
- Muted: Finger to lips, "shh" gesture
- Deafened: Headphones hanging down, eyes closed

**Option 2: Photo-Based**
- Idle: Your normal face
- Talking: Mouth open mid-speech
- Muted: Hand covering mouth
- Deafened: Hands over ears

**Option 3: Abstract/Logo**
- Idle: Your logo normal
- Talking: Logo with soundwave animation
- Muted: Logo with red X
- Deafened: Logo greyed out

### **Where to Get Avatar Art:**

1. **Commission an artist** (Fiverr, Twitter, ArtStation)
2. **Use AI art generators** (Midjourney, DALL-E, Stable Diffusion)
3. **Create in Photoshop/GIMP** with photos
4. **Use VRoid Studio** for 3D character renders
5. **Picrew/Avatar makers** for anime-style avatars

---

## 🔍 Troubleshooting

### **Problem: Avatar not showing in OBS**

**Solutions:**
1. Check the Browser Source URL is correct (right-click → Properties)
2. Make sure width/height aren't 0
3. Try clicking **"Refresh cache of current page"** in Browser Source settings
4. Check you're in a Discord voice channel
5. Visit the URL in your regular browser - does it work there?

---

### **Problem: Avatar not reacting to voice**

**Solutions:**
1. **Make sure you're in Discord voice chat** (the bot can only detect you in voice)
2. **Check you're using the Discord desktop app** (not browser version)
3. **Verify bot is in your server:** Type `/status` - it should respond
4. **Wait 5 seconds** - There's a small delay on initial connection
5. **Refresh the OBS browser source:** Right-click → Refresh

---

### **Problem: Avatar stuck on one state**

**Solutions:**
1. **Refresh OBS browser source**
2. **Leave and rejoin Discord voice**
3. **Check your internet connection** - WebSocket needs stable connection
4. **Try the URL in a regular browser** to see if it updates there
5. **Contact support** if it persists (check GitHub issues)

---

### **Problem: "Avatar not found" error**

**Solutions:**
1. **Make sure you uploaded images:** Type `/avatar view` - does it show a URL?
2. **Re-upload your avatar:** `/avatar upload`
3. **Check you're using the correct user ID** in the URL
4. **For profiles:** Make sure the profile name is correct (case-sensitive slug)

---

### **Problem: Commands not appearing in Discord**

**Solutions:**
1. **Wait up to 1 hour** - Discord commands can take time to propagate globally
2. **Kick and re-invite the bot** to your server
3. **Check bot permissions** - Make sure it has "Use Application Commands"
4. **Try typing `/` and scrolling** - Commands might be there but not suggested
5. **Check bot is online** - It should have a green dot

---

### **Problem: Images are low quality/pixelated**

**Solutions:**
1. **Upload higher resolution images** (1080x1080 minimum)
2. **In OBS Browser Source settings:** Increase Width/Height
3. **Use PNG instead of JPG** for better quality
4. **Check "Custom CSS" in OBS:** Make sure you're not adding blur/filters

---

### **Problem: Group viewing shows wrong person**

**Solutions:**
1. **Make sure everyone has uploaded their avatars** (`/avatar upload`)
2. **Channel URL must be for the correct voice channel** (create new one if needed)
3. **Check voice activity detection** in Discord - Make sure it's sensitive enough
4. **Refresh the browser source** after people join voice

---

## ❓ FAQ

### **Q: Is EchoSprite really free?**
**A:** Yes! Completely free, forever. No subscriptions, no hidden fees.

### **Q: Do I need to install anything?**
**A:** Nope! Just add the Discord bot and use the web URL in OBS. No downloads.

### **Q: What if I don't use OBS? (I use Streamlabs/XSplit/etc.)**
**A:** Any streaming software that supports "Browser Sources" will work! The setup is similar.

### **Q: Can I use this for YouTube/Twitch/Facebook Gaming?**
**A:** Yes! EchoSprite works with any streaming platform. It's just a browser source.

### **Q: Can I use this without streaming (just in Discord)?**
**A:** Yes! You can open the viewer URL in any browser to see your avatar react while you talk.

### **Q: How many profiles can I have?**
**A:** Up to **20 profiles** per user!

### **Q: Can I change my avatar images after uploading?**
**A:** Yes! Just use `/avatar upload` again - it will overwrite your previous images.

### **Q: Does this work with VRChat/VSeeFace/other VTuber software?**
**A:** EchoSprite is image-based (not 3D model tracking). It's simpler than full VTuber rigs but doesn't track face/body movement.

### **Q: What happens if I'm in multiple voice channels?**
**A:** The bot tracks whichever channel you're currently active in.

### **Q: Can I sell/use this commercially?**
**A:** Yes! Use it for monetized streams, commercial podcasts, etc. No restrictions.

### **Q: Is my data/images private?**
**A:** Images are stored securely in a PostgreSQL database. Only you can manage your avatars. We don't sell or share your data.

### **Q: What if the bot goes offline?**
**A:** The hosting service (Render) has 99.9% uptime. If there's downtime, your avatar will freeze on the last known state until reconnection.

### **Q: Can I self-host EchoSprite?**
**A:** Yes! The code is open-source on GitHub. You can deploy your own instance if you want full control.

### **Q: How do I delete my data?**
**A:** Use `/avatar delete` to remove all your images and data permanently.

### **Q: Can I suggest new features?**
**A:** Absolutely! Open an issue on the GitHub repo or contact the developer.

---

## 🎯 Quick Reference: Common Use Cases

### **Solo Streamer (Single Avatar)**
```
1. /avatar upload
2. /avatar view
3. Add URL to OBS as Browser Source
4. Stream!
```

---

### **Solo Streamer (Multiple Themes)**
```
1. /profile create name:"Gaming"
2. /profile upload profile:"Gaming"
3. /profile create name:"Casual"
4. /profile upload profile:"Casual"
5. Create OBS scenes with different profile URLs
6. Switch scenes = Switch avatars!
```

---

### **Podcast/Co-Op Stream (Group View)**
```
1. Everyone: /avatar upload
2. One person: /channel create (while in voice)
3. Copy channel URL
4. Add to OBS as Browser Source
5. Shows whoever is talking!
```

---

### **Multi-Person Panel (Fixed Positions)**
```
1. Get URLs: /avatar view @person1, @person2, @person3
2. Create 3 OBS Browser Sources:
   - Top-left: Person 1's URL
   - Top-right: Person 2's URL
   - Bottom: Person 3's URL
3. All avatars react independently!
```

---

## 🚀 Next Steps

1. **Add the bot to your Discord server** (use the invite link)
2. **Upload your first avatar** (`/avatar upload`)
3. **Add to OBS** (Browser Source with your URL)
4. **Test it!** Talk in Discord and watch it react
5. **(Optional) Create multiple profiles** for different vibes
6. **Go live and enjoy!**

---

## 📞 Support & Community

- **GitHub:** https://github.com/RattusKing/echosprite
- **Issues/Bugs:** https://github.com/RattusKing/echosprite/issues
- **Discord Support:** [Insert your Discord server link if you have one]

---

## 🎉 You're Ready!

EchoSprite is designed to be **simple, powerful, and free**. No complicated setup, no monthly fees, just a reactive avatar that makes your stream more engaging.

**Have fun streaming!** 🎮🎙️✨

---

*Made with ❤️ for the streaming community*
