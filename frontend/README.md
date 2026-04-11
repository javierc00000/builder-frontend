# Frontend Setup

## API target

The frontend reads its backend URL from `VITE_API_BASE`.

Create a local `.env` file in this folder and set:

```bash
VITE_API_BASE=http://127.0.0.1:8000
```

You can also point it at a deployed backend if needed.

## Start frontend

```bash
npm install
npm run dev
```

## Important note

The current local backend in `../backend/main.py` does not yet implement the full AI builder chat API used by this frontend.

Local backend gaps currently include endpoints such as:

- `/chat-agent`
- `/repo-edit`
- `/workspace-edit`
- `/project-state`
- `/project-states`
- `/knowledge-store`
- `/orchestrate`

So the frontend is now configurable for a local backend, but the local backend still needs those endpoints before it will behave the same as the deployed builder backend.
