"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Conversation = { id:string; title:string; summary:string|null; tags:string[]; folder_id:string|null; saved_at:string };
type Folder = { id:string; name:string; color:string };

export function LibraryClient({initialConversations,folders}:{initialConversations:Conversation[];folders:Folder[]}) {
  const [query,setQuery] = useState("");
  const [items,setItems] = useState(initialConversations);
  const [folderName,setFolderName] = useState("");
  const [folderMessage,setFolderMessage] = useState("");
  const [creating,setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    fetch(`/api/conversations?${params.toString()}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Unable to search your library.");
        const result = await response.json();
        setItems(result.conversations || []);
      })
      .catch(error => { if (error.name !== "AbortError") setFolderMessage(error.message); });
    return () => controller.abort();
  }, [query]);

  async function createFolder(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true); setFolderMessage("");
    const response = await fetch("/api/folders", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:folderName})});
    const result = await response.json();
    setCreating(false);
    if (!response.ok) { setFolderMessage(result.error || "Could not create folder."); return; }
    window.location.reload();
  }

  return <div className="library-layout">
    <aside className="library-sidebar">
      <span className="preview-label">YOUR LIBRARY</span>
      <div className="library-folder active">All conversations <b>{items.length}</b></div>
      {folders.map(folder=><div className="library-folder" key={folder.id}><span style={{background:folder.color}}/> {folder.name}</div>)}
      <form className="folder-create" onSubmit={createFolder}>
        <input aria-label="New folder name" value={folderName} onChange={e=>setFolderName(e.target.value)} placeholder="New folder name" maxLength={80} required/>
        <button type="submit" disabled={creating || !folderName.trim()}>{creating ? "…" : "+ Add folder"}</button>
      </form>
      {folderMessage && <p className="sidebar-note">{folderMessage}</p>}
      <p className="sidebar-note">Folders help you group saved conversations by project or topic.</p>
    </aside>
    <section className="library-content">
      <div className="library-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search saved conversations…"/></div>
      {items.length ? <div className="conversation-grid">{items.map(item=><Link className="conversation-card" href={`/library/${item.id}`} key={item.id}><span className="preview-tag">{item.tags?.[0] || "SAVED CHAT"}</span><h2>{item.title}</h2><p>{item.summary || "Saved conversation. Open it to review the content."}</p><small>Saved {new Date(item.saved_at).toLocaleDateString()}</small><span className="open-conversation">Open conversation →</span></Link>)}</div> : <div className="empty-state"><div className="empty-icon">⌁</div><h2>{query ? "No matching conversations" : "Your library starts here."}</h2><p>{query ? "Try a different search term." : "Save a ChatGPT conversation to build your personal, searchable archive."}</p>{!query && <a className="primary-button" href="/save">Save your first conversation <span>→</span></a>}</div>}
    </section>
  </div>;
}
