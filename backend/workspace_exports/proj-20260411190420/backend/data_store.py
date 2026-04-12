import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None


def list_items():
    if not client:
        return []
    result = client.table("items").select("*").order("id", desc=True).execute()
    return result.data or []


def create_item(payload):
    if not client:
        return {"id": 1, **payload}
    result = client.table("items").insert(payload).execute()
    return (result.data or [payload])[0]


def update_item(item_id, payload):
    if not client:
        return {"id": item_id, **payload}
    result = client.table("items").update(payload).eq("id", item_id).execute()
    data = result.data or []
    return data[0] if data else None


def delete_item(item_id):
    if not client:
        return True
    client.table("items").delete().eq("id", item_id).execute()
    return True