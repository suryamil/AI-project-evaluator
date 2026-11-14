# 🚀 Production Deployment & Manual Hosting Guide

Complete guide for manually deploying and hosting the **AI Project Evaluator & Failure Predictor** web application across environments: Docker, Linux VPS (Ubuntu/Debian), Cloud Platforms (Render, Railway, Vercel), or Windows Server.

---

## 📋 Architecture Overview

The system is designed with a **flexible unified architecture**:
- **Frontend**: React 18 Single Page Application (Vite, Tailwind CSS, Lucide Icons, Axios).
- **Backend**: FastAPI Python ASGI service (Motor / MongoMotor, Google GenAI SDK, PyJWT, bcrypt).
- **Database**: MongoDB (Local MongoDB 7.0 container, system service, or MongoDB Atlas free cloud cluster).
- **Unified Full-Stack Mode**: FastAPI automatically serves the built React frontend (`frontend/dist/`) on port `8000`, providing a complete zero-configuration full-stack web application from a single process.

---

## ⚡ Method 1: Docker & Docker Compose (Recommended)

The fastest and most reliable way to deploy to any cloud VPS (DigitalOcean, AWS EC2, Linode, Hetzner, GCP).

### Prerequisites
- Docker & Docker Compose installed on your host.

### Steps
1. **Clone or transfer your project files to the server**:
   ```bash
   git clone <your-repository-url> /opt/ai-evaluator
   cd /opt/ai-evaluator
   ```

2. **Configure your environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your-google-gemini-api-key"
   GEMINI_MODEL="gemini-3.8-flash"
   SECRET_KEY="generate-with-python-secrets-token-hex"
   ```

3. **Start the containers with 1 command**:
   ```bash
   docker-compose up -d --build
   ```

4. **Verify running services**:
   ```bash
   docker-compose ps
   docker-compose logs -f app
   ```
   Your application is now live at: `http://<your-server-ip>:8000`

---

## 🐧 Method 2: Manual Linux VPS Hosting (Ubuntu 22.04 / 24.04 LTS)

Deploy natively on Ubuntu or Debian with Nginx and Systemd.

### Step 1: Install System Prerequisites
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx curl git
```

### Step 2: Install MongoDB Community Edition
```bash
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

### Step 3: Setup Project & Python Environment
```bash
cd /var/www/
sudo git clone <your-repo> ai-evaluator
cd ai-evaluator

# Build Frontend
cd frontend
npm ci --prefer-offline
npm run build
cd ..

# Setup Python Virtual Environment
python3 -m venv backend/.venv
backend/.venv/bin/pip install --upgrade pip
backend/.venv/bin/pip install -r backend/requirements.txt
```

### Step 4: Configure Backend Environment
```bash
cp backend/.env.production.example backend/.env
nano backend/.env
```
Ensure you set your `GEMINI_API_KEY`, strong `SECRET_KEY`, and `ENVIRONMENT=production`.

### Step 5: Configure Systemd Daemon Service
Create `/etc/systemd/system/evalai.service`:
```ini
[Unit]
Description=AI Project Evaluator FastAPI Production Daemon
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/ai-evaluator
EnvironmentFile=/var/www/ai-evaluator/backend/.env
ExecStart=/var/www/ai-evaluator/backend/.venv/bin/python -m uvicorn --app-dir backend app.main:app --host 127.0.0.1 --port 8000 --workers 2

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo chown -R www-data:www-data /var/www/ai-evaluator
sudo systemctl daemon-reload
sudo systemctl enable --now evalai
sudo systemctl status evalai
```

### Step 6: Configure Nginx & SSL
Copy the provided `nginx.conf` to `/etc/nginx/sites-available/evalai`:
```bash
sudo cp /var/www/ai-evaluator/nginx.conf /etc/nginx/sites-available/evalai
sudo ln -s /etc/nginx/sites-available/evalai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

(Optional) Enable free automated SSL via Let's Encrypt Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## ☁️ Method 3: Cloud PaaS Deployment (Render / Railway)

### Deploying to Render
1. Create a free account at [render.com](https://render.com).
2. Connect your GitHub repository.
3. Choose **Web Service**:
   - **Environment**: `Docker` (Render will automatically detect `Dockerfile`).
   - **Port**: `8000`
4. Add Environment Variables in the Render dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `GEMINI_MODEL`: `gemini-3.8-flash`
   - `SECRET_KEY`: A random 64-char string
   - `MONGODB_URL`: MongoDB Atlas connection URI (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/?retryWrites=true&w=majority`)
5. Click **Create Web Service**. Render builds and hosts the app with free SSL (`https://your-app.onrender.com`).

---

## 🌐 Method 4: Split Hosting (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on Vercel/Netlify CDN and backend on Render:

1. **Backend (FastAPI on Render / Railway)**:
   - Deploy `backend/` as a Python Web Service.
   - Start Command: `uvicorn --app-dir backend app.main:app --host 0.0.0.0 --port $PORT`
   - Set `CORS_ORIGINS=https://your-frontend.vercel.app`.

2. **Frontend (Vercel)**:
   - In Vercel, set Root Directory: `frontend`.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variable:
     `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

## 💻 Method 5: Self-Hosted Windows Server / Local Production

To run continuously on Windows:

1. Double-click **`start_production.bat`** in the project root folder.
2. The script:
   - Automatically builds the production React bundle into `frontend/dist/`.
   - Validates the Python environment.
   - Starts multi-worker production Uvicorn on `http://0.0.0.0:8000`.

---

## 🔒 Post-Deployment Security Checklist

- [ ] Changed default `SECRET_KEY` in `backend/.env`.
- [ ] Confirmed `GEMINI_API_KEY` is present and functional.
- [ ] Confirmed MongoDB connection is secured (authenticated or isolated within private network).
- [ ] Verified health check at `https://yourdomain.com/api/health`.
- [ ] Tested project submission, risk analysis, chatbot assistant, and development roadmap.
