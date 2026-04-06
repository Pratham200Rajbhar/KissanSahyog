# 🌾 KissanSahyog: Smart Farming Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org/)

**KissanSahyog** is an AI-powered agriculture decision support system designed to empower farmers with data-driven insights. It combines geospatial satellite data, weather intelligence, and state-of-the-art machine learning models to provide actionable guidance for farm management.

---

## ✨ Features
- **Yield Prediction**: Estimating harvest outcomes based on crop type, state, district, and environmental factors.
- **Crop Recommendation**: Soil-based intelligence for selecting the most profitable crops for your land.
- **Fertilizer Guidance**: Personalized nutrient management based on N-P-K levels and climate context.
- **Disease Detection**: Instant leaf health analysis using deep vision models (ResNet + DenseNet).
- **Satellite Map Insights**: Field vitality monitoring (NDVI) via Sentinel-Hub visualization.
- **AI Assistant**: Conversational AI for plain-language farm guidance and prediction explanations.
- **Multilingual Support**: Fully localized in English, Hindi, and Gujarati.

---

## 🏗️ Repository Architecture
This is a monorepo containing two core applications:
- **`backend/`**: FastAPI API gateway + ML inference services + Supabase integration.
- **`frontend/`**: Next.js dashboard + Dashboard layouts + Map/Chart/Report components.

---

## 🚀 Quick Start (Docker - Recommended)

The easiest way to get started is using **Docker Compose**. It spins up both the frontend and backend in a unified network.

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/Pratham200Rajbhar/KissanSahyog.git
   cd KissanSahyog
   ```

2. **Setup Environment**: 
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - *Populate the keys (see Environment Variables section below).*

3. **Run the Apps**:
   ```bash
   docker compose up --build
   ```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Manual Installation (Local Setup)

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> [!NOTE]
> **Model Auto-Download**: The backend will automatically fetch high-performance ML models from the [Hugging Face Hub](https://huggingface.co/prathamrajbhar11) on first startup (~900MB). No manual model downloading is required!

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

Both services require API keys to function. Create the `.env` files using our templates.

### Backend (`backend/.env`)
| Key | Purpose |
| --- | --- |
| `KISSAN_DB_PROVIDER_URL` | Supabase API URL |
| `KISSAN_DB_SERVICE_KEY` | Supabase Service Role Key |
| `GEMINI_API_KEY` | Google Gemini AI for explanations |
| `KISSAN_GOOGLE_AUTH_CLIENT_ID` | OAuth Client ID for authentication |
| `KISSAN_AUTH_ENCRYPTION_SECRET` | 32-character secret for JWE decryption |

### Frontend (`frontend/.env.local`)
| Key | Purpose |
| --- | --- |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `NEXT_PUBLIC_KISSAN_GATEWAY_ENDPOINT` | URL of the backend API |
| `KISSAN_SH_CLIENT_ID` | Sentinel-Hub ID for satellite data |

---

## 🧬 Machine Learning Models
Our models are open-source and hosted on the **Hugging Face Hub**:
- [🌾 Praapthi (Yield Prediction)](https://huggingface.co/prathamrajbhar11/Praapthi-yield-prediction)
- [🌱 Bijamitra (Crop Recommendation)](https://huggingface.co/prathamrajbhar11/Bijamitra-crop-recommendation)
- [🧪 Poshan (Fertilizer Guidance)](https://huggingface.co/prathamrajbhar11/Poshan-fertilizer-recommendation)
- [🔬 ArogyaDrishti (Disease Detection)](https://huggingface.co/prathamrajbhar11/ArogyaDrishti-crop-disease)

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### 📖 Documentation
For a deep-dive into the technical architecture, please refer to the [project.md dossier](project.md).
