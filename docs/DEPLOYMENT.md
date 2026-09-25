# TraceXen Production Deployment Guide

This guide covers deployment procedures for hosting TraceXen on **Render** (FastAPI Backend), **Vercel** (React Frontend), and connecting to **TigerGraph Savanna Cloud**.

---

## 🌐 Official Production Deployment Targets

- **Frontend Application**: `https://trace-xen.vercel.app/`
- **FastAPI REST Backend**: `https://tracexen.onrender.com`
- **Swagger API Documentation**: `https://tracexen.onrender.com/docs`
- **TigerGraph Cloud**: Savanna `AP-SOUTH-1`, Instance `TG-00` (16Gi R/W), Graph `TraceXenGraph`

---

## 1. Backend Deployment on Render

### Configuration Settings
- **Service Type**: Web Service (Python 3)
- **Repository**: `https://github.com/abi131205/TraceXen`
- **Branch**: `main`
- **Root Directory**: `.`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 10000`

### Environment Variables
Configure the following in the Render Dashboard (**Environment Secrets**):

```env
TG_HOST=https://tg-42b9ad92-ebff-4220-97f5-93f25f0a1f7e.tg-3452941248.i.tgcloud.io
TG_SECRET=your_private_tigergraph_secret
TG_GRAPHNAME=TraceXenGraph
ENVIRONMENT=production
```

---

## 2. Frontend Deployment on Vercel

### Configuration Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables
```env
VITE_API_BASE_URL=https://tracexen.onrender.com/api/v1
```

### SPA Routing Rule (`vercel.json`)
Ensure `frontend/vercel.json` exists for single-page application routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 3. TigerGraph Savanna Setup & Schema Deployment

1. Log into [TigerGraph Cloud Savanna](https://savanna.tgcloud.io).
2. Ensure Workspace `Workspace-1` / Database `Database-1` is active.
3. Deploy graph schema:
   ```bash
   python scripts/deploy_schema_and_sample.py
   ```
4. Verify deployment:
   ```bash
   python scripts/test_tigergraph_connection.py
   ```

---

## 4. Verification Checklist

1. **System Health**: `GET https://tracexen.onrender.com/api/v1/system/status` returns `tigergraph_connected: true`.
2. **CORS Headers**: `Access-Control-Allow-Origin: *` permits Vercel frontend requests.
3. **20-Case Retrieval**: `GET https://tracexen.onrender.com/api/v1/cases` returns 20 objects.
