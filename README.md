# ✨ EchoSprite

**Professional Reactive VTuber Avatars for OBS, Twitch, and YouTube**

A production-ready Discord-integrated avatar tool for PNGTubers and VTubers. Upload avatars from Discord or the web, get OBS browser source URLs, and stream with real-time voice reactivity.

---

## 🎯 Features

### **Core Features**
- ✅ **4 Avatar States**: Idle, Talking, Muted, Deafened
- ✅ **Discord Integration**: OAuth login + Bot voice detection
- ✅ **Group Viewing**: Collaborate with others in real-time
- ✅ **OBS Ready**: Browser source URLs with transparent background
- ✅ **Real-Time Updates**: WebSocket-powered state changes
- ✅ **Discord Slash Commands**: Manage avatars without leaving Discord

### **Production Features**
- ✅ **PostgreSQL Database**: Persistent data storage
- ✅ **Security**: Rate limiting, Helmet headers, input validation
- ✅ **Analytics**: Usage tracking and metrics
- ✅ **Logging**: Winston-powered error and request logging
- ✅ **Legal**: Terms of Service and Privacy Policy pages

### **User Experience**
- 🎨 Professional dark theme UI
- 📱 Responsive design
- ⚡ Loading states and notifications
- 🎯 Drag & drop image uploads
- 🔧 Customizable settings (bounce, fade, spacing, etc.)

---

## 🚀 Quick Start

### **For Streamers/VTubers (Using the Service)**

#### 📚 **[→ COMPLETE STREAMER GUIDE](STREAMER-GUIDE.md)** ← Start Here!

**Quick Setup (5 minutes):**
1. **Add bot to Discord:** [Get invite link from Discord Developer Portal]
2. **Upload avatars:** Type `/avatar upload` in Discord
3. **Get your URL:** Type `/avatar view`
4. **Add to OBS:** Browser Source with your URL
5. **Stream!** Avatar reacts when you talk!

#### **Additional Guides:**
- [→ Discord Commands Reference](DISCORD-COMMANDS.md)
- [→ Profile System Guide](PROFILES-GUIDE.md) - Multiple themes/outfits
- [→ Ready-to-Use Web Dashboard](READY-TO-USE.md)

---

### **For Developers (Self-Hosting)**

#### **Prerequisites:**
- [Render.com](https://render.com) account (free tier available)
- [Discord Developer Application](https://discord.com/developers/applications)
- GitHub account

#### **Deployment Steps:**
1. **Clone and push to GitHub:**
   ```bash
   git clone https://github.com/RattusKing/echosprite.git
   cd echosprite
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Set up PostgreSQL database on Render**
3. **Deploy backend to Render** (with environment variables)
4. **Run database migrations**
5. **Register Discord slash commands**
6. **Enable GitHub Pages for frontend**

[→ Complete Production Deployment Guide](PRODUCTION-DEPLOY.md)

[→ Discord Setup Guide](SETUP-DISCORD.md)

---

## 📁 Project Structure

```
echosprite/
├── frontend/                    # Static web app (GitHub Pages)
│   ├── index.html               # Landing page
│   ├── login.html               # Discord OAuth login
│   ├── app-discord.html         # 4-state dashboard
│   ├── viewer.html              # Individual viewer (OBS)
│   ├── viewer-group.html        # Group viewer (OBS)
│   ├── terms.html               # Terms of Service
│   ├── privacy.html             # Privacy Policy
│   ├── css/
│   │   ├── styles.css           # Main styles
│   │   └── utils.css            # Utility components
│   └── js/
│       ├── config.js            # API configuration
│       ├── api.js               # API client
│       ├── utils.js             # Utilities (loading, notifications, etc.)
│       ├── app-discord.js       # Dashboard logic
│       └── viewer-group.js      # Group viewer logic
│
├── backend/                     # Node.js API + Discord Bot (Render)
│   ├── server.js                # Main Express server (production)
│   ├── db.js                    # PostgreSQL database client
│   ├── logger.js                # Winston logging
│   ├── middleware.js            # Security, rate limiting, validation
│   ├── discord-commands.js      # Slash command definitions
│   ├── discord-handlers.js      # Slash command handlers
│   ├── register-commands.js     # Command registration script
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Database schema
│   │   └── run.js               # Migration runner
│   └── package.json             # Dependencies
│
├── PRODUCTION-DEPLOY.md         # Production deployment guide
├── DISCORD-COMMANDS.md          # Discord slash commands guide
├── SETUP-DISCORD.md             # Discord app setup
├── READY-TO-USE.md              # User guide
├── WHATS-BUILT.md               # Feature status
└── README.md                    # This file
```

---

## 🎮 How to Use (End Users)

### **Solo Streaming:**
1. Upload your avatar (Discord command or web dashboard)
2. Get your individual viewer URL
3. Add to OBS as Browser Source (1920x1080)
4. Join Discord voice channel
5. Your avatar reacts automatically to your voice state!

### **Collaboration Streaming:**
1. All collaborators upload their avatars
2. Join the same Discord voice channel
3. One person gets the group viewer URL
4. Everyone adds the same URL to their OBS
5. All avatars appear together, reacting in real-time!

---

## 🔧 Tech Stack

### **Frontend**
- Pure HTML/CSS/JavaScript (no frameworks)
- Web Audio API (microphone detection)
- WebSocket client (real-time updates)
- Vanilla JS utilities (loading, notifications, etc.)

### **Backend**
- Node.js + Express
- Discord.js v14 (Bot + OAuth)
- PostgreSQL (pg client)
- WebSocket (ws)
- Helmet (security headers)
- express-rate-limit (rate limiting)
- express-validator (input validation)
- Winston (logging)

### **Infrastructure**
- **Frontend:** GitHub Pages (static hosting)
- **Backend:** Render.com (Node.js + PostgreSQL)
- **Discord:** OAuth 2.0 + Bot API

---

## 📊 Discord Slash Commands

EchoSprite includes a full Discord bot with slash commands:

### **Avatar Commands:**
- `/avatar upload` - Upload avatar images
- `/avatar view` - View current config
- `/avatar url` - Get OBS URLs
- `/avatar delete` - Delete avatar

### **Channel Commands:**
- `/channel url` - Get group viewer URL
- `/channel preview` - Preview voice members
- `/channel members` - List members

### **Settings Commands:**
- `/settings bounce` - Toggle bounce animation
- `/settings fade` - Toggle fade effect
- `/settings spacing` - Set avatar spacing
- `/settings show-names` - Toggle username display
- And more...

### **Utility Commands:**
- `/help` - Show help
- `/status` - Check bot status

[→ Full Command Reference](DISCORD-COMMANDS.md)

---

## 🌟 Roadmap

### **✅ Completed**
- [x] Basic avatar upload and preview
- [x] Microphone reactivity (Web Audio API)
- [x] OBS browser source
- [x] Discord OAuth login
- [x] Discord bot voice channel detection
- [x] PostgreSQL database
- [x] Group collaboration scenes
- [x] 4 avatar states (idle, talking, muted, deafened)
- [x] Real-time WebSocket updates
- [x] **Discord slash commands**
- [x] **Production security features**
- [x] **Analytics and logging**
- [x] **Terms of Service and Privacy Policy**

### **🔮 Future Enhancements**
- [ ] Custom animations and transitions
- [ ] Avatar marketplace
- [ ] Webhook integrations (Twitch alerts, etc.)
- [ ] Mobile app
- [ ] AI-powered lip sync
- [ ] 3D avatar support

---

## 🆚 Comparison with FugiTech

| Feature | EchoSprite | FugiTech |
|---------|-----------|----------|
| Discord Voice Detection | ✅ | ✅ |
| 4 Avatar States | ✅ | ✅ |
| Group Viewing | ✅ | ✅ |
| OBS Browser Source | ✅ | ✅ |
| **Discord Slash Commands** | ✅ | ❌ |
| **Web Dashboard** | ✅ | ❌ |
| **PostgreSQL Database** | ✅ | ❌ |
| **Open Source** | ✅ | ❌ |
| **Self-Hostable** | ✅ | ❌ |
| **Free** | ✅ | ❌ |

---

## 🔒 Security Features

- **Rate Limiting**: 100 req/15min (general), 10 req/15min (auth), 50/hour (uploads)
- **Helmet Security Headers**: CSP, XSS protection, clickjacking prevention
- **Input Validation**: All inputs sanitized and validated
- **SQL Injection Prevention**: Parameterized queries
- **Secure Sessions**: PostgreSQL-backed sessions with httpOnly cookies
- **HTTPS Enforcement**: Required in production

---

## 📈 Analytics

Built-in analytics track:
- User logins (Discord OAuth)
- Avatar uploads
- Voice channel activity
- Slash command usage
- Settings changes

View stats: `https://YOUR_BACKEND_URL/api/analytics/stats`

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- Built for VTubers, by VTubers
- Inspired by FugiTech
- Powered by Discord.js, PostgreSQL, and modern web technologies

---

## 📞 Support & Documentation

### **For Streamers:**
- **Complete Streamer Guide**: [STREAMER-GUIDE.md](STREAMER-GUIDE.md) ⭐ **Start here!**
- **Discord Commands**: [DISCORD-COMMANDS.md](DISCORD-COMMANDS.md)
- **Profile System**: [PROFILES-GUIDE.md](PROFILES-GUIDE.md)
- **Web Dashboard**: [READY-TO-USE.md](READY-TO-USE.md)

### **For Developers:**
- **Production Deployment**: [PRODUCTION-DEPLOY.md](PRODUCTION-DEPLOY.md)
- **Discord Setup**: [SETUP-DISCORD.md](SETUP-DISCORD.md)
- **Feature Status**: [WHATS-BUILT.md](WHATS-BUILT.md)

---

## 🎉 Quick Links

- **Live Demo**: https://rattusking.github.io/echosprite/
- **GitHub**: https://github.com/RattusKing/echosprite
- **Discord Bot Invite**: Generate from Discord Developer Portal
- **Backend API**: https://echosprite.onrender.com

---

**Made with 💜 for the VTuber community**

*Reactive avatars made easy. Stream better.*
