# AI Project Evaluator & Failure Predictor

An intelligent full-stack system designed to evaluate machine learning / AI project architectures, assess risk factors, and predict project failure points before deployment.

---

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic, Motor
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## 📁 Project Structure

```text
AI project 2 gem/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Package marker
│   │   ├── main.py              # FastAPI app entry point & CORS configuration
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # Centralized settings & environment loader
│   │   │   └── database.py      # Async MongoDB client setup (Motor)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── project.py       # Pydantic schemas for project evaluation data
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── health.py        # Health & status check endpoint (/api/health)
│   │   └── services/
│   │       └── __init__.py      # Business logic & AI evaluator algorithms
│   ├── .env                     # Local environment settings
│   ├── .env.example             # Example environment template
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── assets/              # Static media files
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page views
│   │   ├── services/
│   │   │   └── api.js           # Axios API service client
│   │   ├── App.jsx              # Main App component with live backend probe
│   │   ├── main.jsx             # React DOM root entry
│   │   └── index.css            # Tailwind CSS directives
│   ├── .env                     # Frontend environment variables
│   ├── .env.example             # Frontend environment example
│   ├── index.html               # Single Page Application HTML host
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.js           # Vite build & Tailwind plugin config
└── README.md                    # Project documentation
```

---

## 🚀 How to Run the Project

### 1. Start the Backend Server (Terminal 1)
```powershell
cd "d:\AI project 2 gem\backend"
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend Client (Terminal 2)
```powershell
cd "d:\AI project 2 gem\frontend"
npm run dev
```
- Frontend UI: `http://localhost:5173`
