# Deployment Guide

This guide covers deploying the EduSense application to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] API keys obtained and tested
- [ ] Build process runs without errors
- [ ] All components render correctly
- [ ] Responsive design tested on multiple devices
- [ ] Accessibility features verified
- [ ] Performance optimizations applied
- [ ] Security review completed

---

## 🚀 Deployment Options

### 1. Vercel (Recommended for React/Vite apps)

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables
Configure in Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add all variables from `.env.example`
3. Redeploy after adding variables

---

### 2. Netlify

#### Via CLI
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Via Git Integration
1. Push code to GitHub
2. Connect repository in Netlify Dashboard
3. Configure build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist`
4. Add environment variables in Site Settings

---

### 3. AWS Amplify

#### Setup
```bash
# Install Amplify CLI
npm i -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

---

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Build and Run
```bash
# Build image
docker build -t edusense:latest .

# Run container
docker run -p 80:80 -d edusense:latest

# With environment variables
docker run -p 80:80 \
  -e NEXT_PUBLIC_STT_API_KEY=your_key \
  -e NEXT_PUBLIC_TRANSLATE_API_KEY=your_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_key \
  -d edusense:latest
```

---

### 5. DigitalOcean App Platform

1. Push code to GitHub
2. Create new App in DigitalOcean
3. Connect GitHub repository
4. Configure build:
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. Add environment variables
6. Deploy

---

## 🔐 Environment Variables Setup

### Development
Create `.env.local`:
```env
NEXT_PUBLIC_STT_API_KEY=dev_stt_key
NEXT_PUBLIC_TRANSLATE_API_KEY=dev_translate_key
NEXT_PUBLIC_LLM_API_KEY=dev_llm_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### Production
Set in your deployment platform:
```env
NEXT_PUBLIC_STT_API_KEY=${STT_API_KEY}
NEXT_PUBLIC_TRANSLATE_API_KEY=${TRANSLATE_API_KEY}
NEXT_PUBLIC_LLM_API_KEY=${LLM_API_KEY}
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

---

## ⚡ Performance Optimization

### 1. Build Optimization
```json
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'sonner'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 2. Enable Compression
Most platforms enable gzip/brotli automatically. For custom servers:
```bash
# Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Express.js
const compression = require('compression');
app.use(compression());
```

### 3. CDN Configuration
Configure CDN to cache static assets:
- Cache HTML: No cache or short TTL
- Cache JS/CSS: Long TTL with versioning
- Cache images: Long TTL

---

## 🔒 Security Configuration

### 1. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.yourdomain.com wss://api.yourdomain.com;">
```

### 2. HTTPS Enforcement
```nginx
# Nginx redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. API Key Security
- Never commit API keys to Git
- Use environment variables
- Rotate keys regularly
- Set up billing alerts
- Use backend proxy for sensitive calls

---

## 📊 Monitoring Setup

### 1. Error Tracking (Sentry)
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Analytics (Google Analytics)
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 3. Performance Monitoring
```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_STT_API_KEY: ${{ secrets.STT_API_KEY }}
          NEXT_PUBLIC_TRANSLATE_API_KEY: ${{ secrets.TRANSLATE_API_KEY }}
          NEXT_PUBLIC_LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🌍 Backend Deployment

### Node.js WebSocket Server (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create edusense-api

# Deploy
git push heroku main

# Set environment variables
heroku config:set NODE_ENV=production
```

### AWS Lambda + API Gateway
Use Serverless Framework or AWS SAM for serverless deployment.

---

## 📱 PWA Configuration

### manifest.json
```json
{
  "name": "EduSense",
  "short_name": "EduSense",
  "description": "Real-Time Multilingual Lecture Assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF9E6",
  "theme_color": "#FFB84D",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
      ]);
    })
  );
});
```

---

## 🧪 Pre-Production Testing

### Lighthouse Audit
```bash
npm install -g lighthouse
lighthouse https://your-staging-url.com --view
```

### Load Testing
```bash
npm install -g artillery
artillery quick --count 100 --num 10 https://your-api.com
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, DigitalOcean Load Balancer)
- Deploy multiple instances
- Session management with Redis

### Caching
- Implement Redis for translation cache
- CDN for static assets
- Browser caching headers

### Database
- Use managed database service (AWS RDS, DigitalOcean Managed DB)
- Implement connection pooling
- Set up read replicas

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Environment Variables Not Working
- Check variable names start with `NEXT_PUBLIC_`
- Verify variables are set in deployment platform
- Restart/redeploy after adding variables

### WebSocket Connection Issues
- Ensure WSS (not WS) in production
- Check CORS configuration
- Verify firewall rules

---

## 📞 Support

For deployment issues:
1. Check deployment platform documentation
2. Review error logs
3. Verify environment variables
4. Test API endpoints separately

---

**Remember**: Always test in a staging environment before deploying to production!
