# <p align="center">🌱 Agri-Connect</p>

<p align="center">
  <strong>Next-Gen Agricultural Supply Chain & AI Logistics Orchestrator</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Supabase-Database-blue?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

---

## 🚀 The Vision

Agri-Connect is a decentralized supply chain platform designed to eliminate the "Middleman Tax" by connecting farmers directly to retail clusters. Using AI-driven logistics and real-time tracking, we ensure freshness, transparency, and fair pricing for everyone.

### ✨ Key Features

- **🚜 Direct-to-Buyer Marketplace**: Farmers list harvests directly, retaining up to 60% higher profits.
- **🚚 AI Route Commander**: Real-time route optimization for logistics partners to minimize transit time.
- **🛡️ Smart Escrow System**: Secure payments protect both parties—funds are released only upon verification.
- **📍 Precision Geo-Origin**: 100% traceability with GPS-tagged crop origins.
- **🔔 Real-time Notifications**: Instant updates for orders, routes, and harvest alerts via Socket.io.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & Lucide React
- **State Management**: Zustand
- **Real-time**: Socket.io Client

### Backend
- **Engine**: Node.js & Express
- **Database**: Supabase (Postgres)
- **ORM**: Drizzle ORM
- **Authentication**: JWT with Role-Based Access Control (RBAC)
- **Logistics**: Custom AI Routing Engine

---

## 📦 Project Structure

```bash
├── 📁 agri-connect
│   ├── 📁 frontend    # Next.js Application
│   ├── 📁 backend     # Express API Server
│   └── 📁 shared      # Shared Zod Schemas & Types
├── 📄 render.yaml     # Infrastructure as Code (Render)
└── 📄 .gitignore      # Root Git Management
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js (v20+)
- Supabase Account
- Render (Backend) & Vercel (Frontend) accounts for deployment

### Local Setup

1. **Clone the Repo**
   ```bash
   git clone https://github.com/PasinduLakmith11/agri-connect.git
   cd agri-connect
   ```

2. **Backend Config**
   ```bash
   cd agri-connect/backend
   npm install
   # Create a .env file with DATABASE_URL and JWT_SECRET
   npm run build
   npm run start
   ```

3. **Frontend Config**
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local with NEXT_PUBLIC_API_URL
   npm run dev
   ```

---




