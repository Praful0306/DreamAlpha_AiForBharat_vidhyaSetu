# Vidya-Setu (AWS Serverless Ready)

This is the production-ready React + FastAPI AWS Prototype. 
It has been configured strictly according to the hackathon requirements.

## 🚀 Quick Start Guide

### 1. Backend (FastAPI) Setup
Open a terminal in the `vidhyaSetu/backend` folder.

1. Install Python (if not installed) and `uv` (the fast package manager):
```bash
pip install uv
```

2. Create the virtual environment and sync dependencies:
```bash
uv sync --dev
```

3. Add your API Keys:
Copy `.env.example` to `.env` if it doesn't exist. **Make sure your valid AWS and Groq keys are added to this file.**

4. Run the Dev Server:
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (React) Setup
Open a **new** terminal in the `vidhyaSetu/frontend` folder.

1. Install Node modules:
```bash
npm install
```

2. Run the App:
```bash
npm start
```
This will open `http://localhost:3000` in your browser. The frontend is automatically configured to talk to the backend on port `8000` via `127.0.0.1`.

### Troubleshooting
- **Failed to fetch:** Ensure both the frontend and backend servers are running simultaneously in two separate terminal windows.
- **Module Clicks doing nothing / Errors:** Ensure your AWS Credentials in the backend `.env` file are correct and have Amazon Bedrock access enabled.
