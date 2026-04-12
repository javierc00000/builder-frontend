# Backend Deploy

## Local run

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Local dev in VS Code

Use the workspace tasks in `.vscode/tasks.json` so each step is visible and restartable:

- `backend: stop local`
- `backend: start local`
- `frontend: start local`
- `api: check local health`

These tasks avoid waiting on Python environment discovery when you only need to restart the backend or confirm local CORS/health.

Recommended restart flow:

1. `backend: stop local`
2. `backend: start local`
3. `api: check local health`
4. Refresh the local frontend page

If `5173` is busy, stop the old frontend task first or run Vite on another port and keep the backend on `127.0.0.1:8000`.

## Render deploy

Use the repository root `render.yaml` blueprint, or create a Render Web Service with:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Public frontend wiring

After the backend is deployed, redeploy the frontend with:

```bash
VITE_API_BASE=https://your-backend-url npm run deploy
```

## Workspace edits

The `/workspace-edit` endpoint writes generated files into `backend/workspace_exports/<project-id>/`.

That gives the builder a real file-writing apply path without overwriting the builder app source tree.
