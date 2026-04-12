from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List
from data_store import list_items, create_item, update_item, delete_item

app = FastAPI(title="Generated App Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemPayload(BaseModel):
    title: str = "Untitled"
    status: str = "draft"
    value: Any = None
    meta: Dict[str, Any] = Field(default_factory=dict)



class LoginPayload(BaseModel):
    email: str = ""
    password: str = ""

@app.post("/api/auth/login")
def login(payload: LoginPayload):
    email = (payload.email or "guest@example.com").strip() or "guest@example.com"
    return {
        "ok": True,
        "token": f"demo-token-{email}",
        "user": {"email": email, "role": "member"},
    }

@app.get("/api/auth/me")
def auth_me():
    return {"ok": True, "user": {"email": "demo@example.com", "role": "member"}}

@app.post("/api/auth/logout")
def logout():
    return {"ok": True}


@app.get("/health")
def health():
    return {"status": "ok", "persistence": "supabase"}

@app.get("/api/items")
def get_items():
    return list_items()

@app.post("/api/items")
def post_item(payload: ItemPayload):
    return create_item(payload.model_dump())

@app.put("/api/items/{item_id}")
def put_item(item_id: int, payload: ItemPayload):
    updated = update_item(item_id, payload.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated

@app.delete("/api/items/{item_id}")
def remove_item(item_id: int):
    deleted = delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True, "id": item_id}