# 🌾 YieldIQ

**AI-Powered Precision Agriculture & Farm Management Platform**

YieldIQ is an enterprise-grade precision agriculture platform designed to empower farmers and agronomists with data-driven insights. Transitioning from hackathon concept to a production-ready system, YieldIQ combines advanced generative AI with a robust multi-plot architecture to deliver actionable harvest forecasts, automated agronomic strategies, and streamlined farm administration.

## 🚀 Key Features

- **🧠 Expert AI Agronomist**: Generates precision-driven 8-part cultivation strategies, economic P&L projections, GDD-based calendars, and integrated pest management plans using Gemini 2.0 Flash and Genkit.
- **🗣️ Multilingual Assistant**: A conversational AI capable of answering queries in regional Indian languages (Hindi, Marathi) and English.
- **📊 Dynamic Multi-Plot Architecture**: Robust tracking of farm acreage and individual plot details across cloud (Supabase) and local storage.
- **🔬 Smart Lab Report Parsing**: Streamlined interface for uploading/assigning plot-specific lab reports, automatically driving AI-generated recommendations.
- **🛡️ Secure Admin Dashboard**: Startup-grade command center with Role-Based Access Control (RBAC), global farm monitoring, and secure user management.
- **🗺️ Interactive Data Dashboards**: Real-time visualization using Recharts for harvest tracking, forecasting, and resource mapping.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI
- **Backend/Database**: Supabase (PostgreSQL, Cloud Storage)
- **Authentication**: NextAuth.js (Google OAuth, secure RBAC via email whitelisting)
- **Generative AI**: Google Genkit 1.x, Google Gemini 2.0 Flash
- **Charts & Mapping**: Recharts, Leaflet
- **Deployment**: Vercel

## 📦 Quick Start

Refer to the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for comprehensive local installation and environment instructions.

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd yieldiq
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 📄 License & Status

This project is licensed under the MIT License - see the LICENSE file for details.
