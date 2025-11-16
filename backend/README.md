# EchoSprite Backend

Backend API for the EchoSprite VTuber avatar tool.

## Features

- Avatar configuration storage
- RESTful API endpoints
- Ready for Discord OAuth integration
- Ready for Discord bot voice channel integration

## Local Development

```bash
cd backend
npm install
npm start
```

Server will run on `http://localhost:3000`

## Deployment to Render

1. Push this code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: echosprite-api
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables from `.env.example` as needed
7. Click "Create Web Service"

Render will auto-deploy on every push to your main branch!

## API Endpoints

### Health Check
```
GET /health
```

### Save Avatar Config
```
POST /api/avatar-config
Body: { idleImage, talkingImage, sensitivity }
```

### Get Avatar Config
```
GET /api/avatar-config/:publicId
```

## Future Features

- Discord OAuth login
- Discord bot integration
- PostgreSQL database
- User accounts
- Group collaboration scenes
