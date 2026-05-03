# Altreon - AI-Driven Incident Response Platform

Altreon is a modern, AI-powered cybersecurity incident response platform designed to streamline triage, correlation, and resolution of security threats. It features a high-fidelity web dashboard for admins, a secure reporting hub for users, and a mobile application for real-time monitoring.

## Project Structure

- **/backend**: FastAPI (Python) server handling data persistence, AI analysis, and incident correlation.
- **/front**: React + Vite + Tailwind CSS web application for both admin triage and user reporting.
- **/mobile**: Flutter application for mobile incident monitoring and administrative oversight.

---

## 🚀 Setup Instructions

### 1. Backend (Python/FastAPI)

The backend manages the SQLite databases and AI logic.

**Prerequisites**: Python 3.9+

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Database Initialization**:
```bash
python setup_db.py
```

**Running the Server**:
```bash
python run.py
```
*Server will be available at `http://127.0.0.1:8000`*

---

### 2. Frontend (React/Vite)

The web dashboard and reporting hub.

**Prerequisites**: Node.js 18+

```bash
cd front
npm install
npm run dev
```
*Frontend will be available at `http://localhost:5173`*

---

### 3. Mobile (Flutter)

The administrative mobile dashboard.

**Prerequisites**: Flutter SDK (v3.0+)

```bash
cd mobile
flutter pub get
```

**Running on Emulator/Device**:
```bash
flutter run
```
*Note: Ensure the backend is running and reachable. For Android emulators, the API base is usually mapped to `http://10.0.2.2:8000`.*

---

## 🛠 Features

- **AI Triage**: Automated analysis of incident logs using Gemini/LLM integration.
- **Incident Correlation**: Automatic detection of related security events across the system.
- **Secure Reporting**: Anonymous and encrypted incident reporting hub for employees.
- **Compliance Vault**: Immutable audit trails and high-fidelity reporting.
- **Real-time Notifications**: Mobile alerts for critical security events.

## 📄 License

This project is proprietary and for internal use only.
