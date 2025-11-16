# 🎮 EchoSprite Quick Reference Card

**Bookmark this page for fast command lookups!**

---

## 🚀 First Time Setup (5 Minutes)

1. **Add bot:** [Your Discord invite link]
2. **Upload:** `/avatar upload` (attach 4 images)
3. **Get URL:** `/avatar view`
4. **OBS:** Add Browser Source → Paste URL
5. **Done!** Join Discord voice and stream

---

## 📋 Essential Commands

### **Avatar Management**
```
/avatar upload          Upload 4 images (idle, talking, muted, deafened)
/avatar view            Get your OBS URL
/avatar delete          Delete your avatar
```

### **Multiple Profiles/Themes**
```
/profile create name:"Gaming"      Create new profile
/profile upload profile:"Gaming"   Upload images to profile
/profile switch profile:"Gaming"   Switch active profile
/profile list                      See all profiles
/profile url profile:"Gaming"      Get specific profile URL
```

### **Group Viewing**
```
/channel create         Create group viewer (in voice channel)
/channel view           Get group URL
```

### **Help**
```
/help                   Show all commands
/status                 Check bot status
```

---

## 🎥 OBS Setup

**Browser Source Settings:**
- **URL:** Your avatar URL from `/avatar view`
- **Width:** `1080`
- **Height:** `1080`
- **FPS:** `30`
- ✅ Check "Shutdown source when not visible"
- ✅ Check "Refresh browser when scene becomes active"

---

## 🎨 Image Requirements

- **Format:** PNG (transparent), JPG, or GIF
- **Size:** Under 10MB each
- **Dimensions:** 1080x1080 recommended
- **Tip:** Use transparent PNG for floating avatars!

**You need 4 images:**
1. 💤 **Idle** - Default resting pose
2. 🗣️ **Talking** - Mouth open, speaking
3. 🔇 **Muted** - Mic muted (hand over mouth)
4. 🔕 **Deafened** - Headphones off (eyes closed)

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Avatar not showing | Refresh OBS browser source |
| Not reacting | Make sure you're in Discord voice |
| Stuck on one state | Leave/rejoin Discord voice |
| Commands missing | Wait 1 hour or re-invite bot |
| Low quality | Upload higher resolution images |

---

## 💡 Pro Tips

### **Multiple Themes:**
Create OBS scenes with different profile URLs:
- **Gaming Scene:** `?profile=gaming`
- **Casual Scene:** `?profile=casual`
- Switch scenes = Instant avatar change!

### **Multi-Person Streams:**
Everyone uploads avatars → Get channel URL → Everyone uses same URL in OBS!

### **Quick Refresh:**
Right-click Browser Source → "Refresh" to reload avatar

---

## 📊 Common URL Formats

### **Your Default Avatar:**
```
https://rattusking.github.io/echosprite/viewer.html?userId=YOUR_ID&mode=discord
```

### **Specific Profile:**
```
https://rattusking.github.io/echosprite/viewer.html?userId=YOUR_ID&profile=gaming
```

### **Group Channel:**
```
https://rattusking.github.io/echosprite/viewer.html?channelId=CHANNEL_ID
```

---

## 🎯 Quick Workflows

### **Solo Streamer:**
```
1. /avatar upload
2. /avatar view
3. Add to OBS
4. Stream!
```

### **Theme Switcher:**
```
1. /profile create name:"Theme1"
2. /profile upload profile:"Theme1"
3. Repeat for more themes
4. Create OBS scenes with different ?profile= URLs
5. Switch scenes to switch avatars!
```

### **Podcast/Co-Op:**
```
1. Everyone: /avatar upload
2. Join voice channel
3. /channel create
4. Everyone adds channel URL to OBS
5. Shows active speaker automatically!
```

---

## 📞 Support

- **Full Guide:** [STREAMER-GUIDE.md](STREAMER-GUIDE.md)
- **Commands:** [DISCORD-COMMANDS.md](DISCORD-COMMANDS.md)
- **Profiles:** [PROFILES-GUIDE.md](PROFILES-GUIDE.md)
- **GitHub:** https://github.com/RattusKing/echosprite

---

**🎉 You're ready to stream with EchoSprite!**

*Print this page or bookmark it for quick reference while streaming*
