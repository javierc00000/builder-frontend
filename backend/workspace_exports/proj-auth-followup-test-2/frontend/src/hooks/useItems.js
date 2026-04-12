import { useEffect, useState } from "react";
import { getItems, createItem, updateItem, deleteItem } from "../lib/api.js";

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  async function addItem(payload) {
    const created = await createItem(payload);
    setItems((prev) => [created, ...prev]);
    return created;
  }

  async function saveItem(id, payload) {
    const updated = await updateItem(id, payload);
    setItems((prev) => prev.map((item) => item.id === id ? updated : item));
    return updated;
  }

  async function removeItem(id) {
    await deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  useEffect(() => { refresh(); }, []);

  return { items, loading, error, refresh, addItem, saveItem, removeItem };
}