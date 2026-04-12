import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("app.db")


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init():
    conn = _connect()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            value TEXT,
            meta TEXT
        )
        """
    )
    conn.commit()
    conn.close()


_init()


def list_items():
    conn = _connect()
    rows = conn.execute("SELECT id, title, status, value, meta FROM items ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


def create_item(payload):
    conn = _connect()
    cursor = conn.execute(
        "INSERT INTO items (title, status, value, meta) VALUES (?, ?, ?, ?)",
        (payload.get("title", "Untitled"), payload.get("status", "draft"), str(payload.get("value")), json.dumps(payload.get("meta", {}))),
    )
    conn.commit()
    item_id = cursor.lastrowid
    conn.close()
    return {"id": item_id, **payload}


def update_item(item_id, payload):
    conn = _connect()
    cursor = conn.execute(
        "UPDATE items SET title = ?, status = ?, value = ?, meta = ? WHERE id = ?",
        (payload.get("title", "Untitled"), payload.get("status", "draft"), str(payload.get("value")), json.dumps(payload.get("meta", {})), item_id),
    )
    conn.commit()
    conn.close()
    if not cursor.rowcount:
        return None
    return {"id": item_id, **payload}


def delete_item(item_id):
    conn = _connect()
    cursor = conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return bool(cursor.rowcount)