# Deployment notes

This repo contains a minimal Dockerfile and docker-compose for running Wanggy bot.

Steps (example):
1. Copy secrets.example.env to .env and set WEB_JWT_SECRET, ALLOW_PUBLIC_PAIR if needed.
2. Build and run:
   docker-compose up -d --build
3. Point a reverse proxy (nginx) to expose port 3000 and enable HTTPS.

Security:
- Protect the web socket with authentication (JWT) if exposing to public.
- Do not commit .env to repository.

Running with PM2 on a server:
1. npm ci
2. pm2 start src/index.js --name wanggy
3. pm2 save

