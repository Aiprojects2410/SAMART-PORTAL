# 🎓 Samarth eGov - Kumaun University Student & Admin Portal

Official-inspired **Kumaun University Student Portal & Centralized Admin Console** built with vanilla HTML5, CSS3, JavaScript, LocalStorage, and **Supabase Cloud Database Integration**.

---

## 🔗 Live URLs & Repository
- **🚀 Main Student Login**: `index.html` (or `http://localhost:8000`)
- **🛡️ Direct Admin Portal URL**: `admin.html` (or `http://localhost:8000/admin.html`)
- **GitHub Repository**: [https://github.com/Aiprojects2410/SAMART-PORTAL](https://github.com/Aiprojects2410/SAMART-PORTAL)

---

## ⚡ Supabase Cloud Database Integration

### 1. Pre-configured Credentials:
- **Project URL**: `https://hxsdjyhkmoltzrdamruw.supabase.co`
- **Publishable / Anon Key**: `sb_publishable_uvkMzbLZPBrG6Qk1i25bfg_9YOQEAWY`
- **Config File**: [`js/supabase-config.js`](js/supabase-config.js)

### 2. Database Schema Setup (1-Minute Setup):
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** -> Click **New Query**.
3. Copy all code from [`supabase-schema.sql`](supabase-schema.sql) and paste it into the editor.
4. Click **Run**.
5. All 3 tables (`students`, `grade_cards`, `grievance_tickets`) with Row Level Security (RLS) policies and seed data will be created!

---

## 🚀 Netlify Deployment Guide

### Option A: Automatic Deploy via GitHub (Recommended)
1. Log in to [Netlify](https://app.netlify.com).
2. Click **Add new site** -> **Import an existing project** -> **GitHub**.
3. Select your repository: `Aiprojects2410/SAMART-PORTAL`.
4. Deploy Settings:
   - **Branch to deploy**: `main`
   - **Build command**: *(Leave blank)*
   - **Publish directory**: `.`
5. Click **Deploy Site**. Your site will be live instantly!

### Option B: Netlify Environment Variables (Optional)
If you want to manage Supabase keys as environment variables:
1. In Netlify Dashboard, go to: **Site configuration** -> **Environment variables**.
2. Click **Add a variable**:
   - `SUPABASE_URL`: `https://hxsdjyhkmoltzrdamruw.supabase.co`
   - `SUPABASE_ANON_KEY`: `sb_publishable_uvkMzbLZPBrG6Qk1i25bfg_9YOQEAWY`
3. Click **Save**.

---

## 🔑 Login Credentials

| Role | Username / Enrolment | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Student** (Mohd Mohsin Khan) | `KU20247319` | `Mohsin@8080` | `index.html` |
| **Admin** | `admin` | `Admin@123` | `admin.html` (Direct Link Only) |

---

## ✨ Key Features
- **Auto-Generative Student Login IDs & Roll Numbers** in Admin Console.
- **Manual Student Password Creation & Suggestions**.
- **100% Mobile & Cross-Device Responsive Layout** (Zero cutoffs on Phones, Tablets, Windows PCs).
- **Authentic Chunky Blue Captcha Generator** (Dynamic random tilted digits on each refresh).
- **Original PDF Grade Cards Embedded & Downloadable** (B.Com 2022–2024 First Division).
- **Real-time Student Helpdesk & Admin Resolution Hub**.
- **3D Flippable Digital Student ID Card** with QR verification.
