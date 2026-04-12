# Frontend Setup

## API target

The frontend reads its backend URL from `VITE_API_BASE`.

Create a local `.env` file in this folder and set:

```bash
VITE_API_BASE=http://127.0.0.1:8000
```

You can also point it at a deployed backend if needed.

For the public site, deploy the frontend with a deployed backend URL:

```bash
VITE_API_BASE=https://your-backend-url npm run deploy
```

## Start frontend

```bash
npm install
npm run dev
```

## Important note

The local backend now exposes the compatibility endpoints this frontend uses, including `/chat-agent`, `/repo-edit`, `/workspace-edit`, `/project-state`, `/project-states`, `/knowledge-store`, and `/orchestrate`.

`/workspace-edit` writes generated files into `backend/workspace_exports/<project-id>/` so “apply this” can create real files without overwriting the builder app source itself.

If you want the public Workers site to use the same backend logic, deploy the backend separately and point `VITE_API_BASE` at that backend during frontend deploy.
