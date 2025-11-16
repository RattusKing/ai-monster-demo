# ✨ EchoSprite

**Reactive VTuber Avatars Made Easy**

A FugiTech-style reactive avatar tool for PNGTubers that's easier and clearer to use. Perfect for streamers who want simple, effective avatar reactivity without complicated setups.

## 🎯 Features

- **Simple Setup**: Upload idle and talking PNGs - no complex rigging needed
- **Mic Reactive**: Automatically switches between states when you speak
- **OBS Ready**: Get a browser source URL with transparent background
- **GitHub-First**: Deploy frontend via GitHub Pages, backend via Render
- **Coming Soon**: Discord OAuth + voice channel reactivity + group scenes

## 🚀 Quick Start

### Frontend (GitHub Pages)

The frontend is a static site - no build process needed!

1. All files are in `/frontend`
2. Enable GitHub Pages: Settings → Pages → Source: Deploy from branch → Select `main` and `/frontend` folder
3. Visit your GitHub Pages URL

### Backend (Render)

1. Push this repo to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Deploy!

## 📁 Project Structure

```
echosprite/
├── frontend/          # Static web app (GitHub Pages)
│   ├── index.html     # Landing page
│   ├── app.html       # Dashboard
│   ├── viewer.html    # OBS browser source
│   ├── css/           # Styles
│   └── js/            # Frontend logic
├── backend/           # Node.js API (Render)
│   ├── server.js      # Express server
│   └── package.json   # Dependencies
└── README.md
```

## 🎮 How to Use

1. **Upload Images**: Go to the app and upload your idle and talking PNGs
2. **Test Mic**: Click "Start Mic Test" to see your avatar react to your voice
3. **Adjust Sensitivity**: Use the slider to set the talking threshold
4. **Copy OBS URL**: Add the browser source URL to OBS Studio
5. **Stream!**: Your avatar will now react to your microphone input

## 🔧 Tech Stack

- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks!)
- **Backend**: Node.js + Express
- **Audio**: Web Audio API
- **Storage**: LocalStorage (client-side), In-memory (server-side, will upgrade to database)

## 🌟 Roadmap

- [x] Basic avatar upload and preview
- [x] Microphone reactivity
- [x] OBS browser source
- [ ] Discord OAuth login
- [ ] Discord bot voice channel detection
- [ ] Cloud avatar storage
- [ ] Group collaboration scenes
- [ ] Custom animations and transitions

## 📝 License

MIT

## 🤝 Contributing

Built for VTubers, by VTubers. Contributions welcome!