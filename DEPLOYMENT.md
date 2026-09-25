# Comprehensive Manual Deployment Guide

This guide provides step-by-step instructions for manually pushing code to GitHub, deploying the **FastAPI Backend** and **PostgreSQL Database** to **Render**, deploying the **Next.js Frontend** to **Vercel**, and triggering manual deployment via **GitHub Actions**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: GitHub Repository Setup](#step-1-github-repository-setup)
3. [Step 2: Backend & Database Deployment on Render](#step-2-backend--database-deployment-on-render)
   - [Method A: Deploy using render.yaml (Recommended)](#method-a-deploy-using-renderyaml-recommended)
   - [Method B: Manual Web Service Setup](#method-b-manual-web-service-setup)
4. [Step 3: Frontend Deployment on Vercel](#step-3-frontend-deployment-on-vercel)
   - [Method A: Vercel Dashboard Deployment](#method-a-vercel-dashboard-deployment)
   - [Method B: Vercel CLI Deployment](#method-b-vercel-cli-deployment)
5. [Step 4: Manual GitHub Actions Deployment Workflow](#step-4-manual-github-actions-deployment-workflow)
6. [Step 5: Post-Deployment Verification & Troubleshooting](#step-5-post-deployment-verification--troubleshooting)

---

## Prerequisites

Before beginning deployment, ensure you have:

- A **GitHub** account and a created repository for this project.
- A **Render** account ([render.com](https://render.com)).
- A **Vercel** account ([vercel.com](https://vercel.com)).
- Git installed on your local system.

---

## Step 1: GitHub Repository Setup

### 1. Initialize and Push Code to GitHub

Open your terminal in the project root folder:

```bash
# Initialize git (if not already done)
git init

# Add all files and commit
git add .
git commit -m "Initial commit for production deployment"

# Rename branch to main
git branch -M main

# Add your GitHub repository remote URL
git remote add origin https://github.com/kpraman-service/FINANCE.git

# Push code to GitHub
git push -u origin main
```

---

## Step 2: Backend & Database Deployment on Render

### Method A: Deploy using `render.yaml` (Recommended)

Render can automatically parse the [`render.yaml`](file:///c:/Users/Tamilarasan%20M/OneDrive/Documents/FINANCE-main/render.yaml) file located in your project root.

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub account and select your repository.
4. Render will detect `render.yaml` and create:
   - **PostgreSQL Database** (`finance-db`)
   - **FastAPI Web Service** (`finance-backend`)
   - **Next.js Web Service** (`finance-frontend`) *(optional if using Vercel)*
5. Click **Apply**.
6. Note the URL generated for your backend service (e.g., `https://finance-backend-xxxx.onrender.com`).

---

### Method B: Manual Web Service Setup

If you prefer setting up services manually on Render:

#### 1. Create PostgreSQL Database:
1. Go to Render Dashboard -> **New +** -> **PostgreSQL**.
2. Name: `finance-db`
3. Database: `finance_db`
4. User: `finance_user`
5. Select **Free** plan and click **Create Database**.
6. Copy the **Internal Database URL** or **External Database URL**.

#### 2. Create FastAPI Web Service:
1. Go to Render Dashboard -> **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `finance-backend`
   - **Region**: Select your closest region
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   - `DATABASE_URL`: *(paste connection string from PostgreSQL step)*
   - `JWT_SECRET`: *(enter a strong secret key)*
   - `JWT_ALGORITHM`: `HS256`
   - `JWT_EXPIRATION_HOURS`: `168`
   - `CORS_ORIGINS`: `*` (or your Vercel URL once deployed)
   - `ENVIRONMENT`: `production`
5. Click **Create Web Service**.

---

## Step 3: Frontend Deployment on Vercel

### Method A: Vercel Dashboard Deployment

1. Log into [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository.
4. Configure Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://finance-backend-xxxx.onrender.com`)
6. Click **Deploy**.

---

### Method B: Vercel CLI Deployment

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run deployment from the project root:
   ```bash
   vercel --prod
   ```
3. Follow the CLI prompts:
   - Link to existing project? `N`
   - What's your project's name? `finance-frontend`
   - In which directory is your code located? `./frontend`

---

## Step 4: Manual GitHub Actions Deployment Workflow

To trigger deployment manually from GitHub's UI at any time, a manual GitHub Action workflow can be configured using `workflow_dispatch`.

### 1. Workflow File Created: `.github/workflows/deploy.yml`

This workflow allows manual dispatch from the **Actions** tab on GitHub:

- Go to GitHub Repository -> **Actions**.
- Select **Manual Deployment** from the left sidebar.
- Click **Run workflow** -> Select target environment -> Click **Run workflow**.

---

## Step 5: Post-Deployment Verification & Troubleshooting

### 1. Verify Backend Health
Open `https://<YOUR-RENDER-BACKEND-URL>/health` in your browser.
Expected output:
```json
{"status": "healthy", "timestamp": "..."}
```

### 2. Check Interactive API Documentation
Open `https://<YOUR-RENDER-BACKEND-URL>/docs` to view FastAPI Swagger UI.

### 3. Verify CORS Settings
If frontend requests fail due to CORS errors:
- Update `CORS_ORIGINS` in Render backend environment variables to match your exact Vercel URL (e.g., `https://finance-frontend.vercel.app`).
