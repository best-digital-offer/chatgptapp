"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteConversationButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function remove() {
    if (!window.confirm("Delete this saved conversation? This cannot be undone.")) return;
    setBusy(true);
    const response = await fetch(`/api/conversations/${encodeURIComponent(id)}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) { window.alert("Unable to delete this conversation. Please try again."); return; }
    router.push("/library");
    router.refresh();
  }
  return <button className="danger-button" type="button" onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Delete conversation"}</button>;
}
