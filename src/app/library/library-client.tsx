"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Conversation = { id:string; title:string; summary:string|null; tags:string[]; folder_id:string|null; saved_at:string };
type Folder = { id:string; name:string; color:string };

export function LibraryClient({initialConversations,folders}:{initialConversations:Conversation[];folders:Folder[]}) {
  const [query,setQuery] = useState("");
  const [selectedFolder,setSelectedFolder] = useState("all");
  const [items,setItems] = useState(initialConversations);
  const [folderName,setFolderName] = useState("");
  const [folderMessage,setFolderMessage] = useState("");
  const [creating,setCreating] = useState(false);
  const [movingId,setMovingId] = useState<string|null>(null);

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

  const visibleItems = useMemo(
    () => selectedFolder === "all" ? items : items.filter(item => item.folder_id === selectedFolder),
    [items,selectedFolder]
  );

  async function createFolder(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true); setFolderMessage("");
    const response = await fetch("/api/folders", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:folderName})});
    const result = await response.json();
    setCreating(false);
    if (!response.ok) { setFolderMessage(result.error || "Could not create folder."); return; }
    window.location.reload();
  }

  async function moveConversation(conversationId:string, folderId:string) {
    setMovingId(conversationId); setFolderMessage("");
    const response = await fetch("/api/conversations",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId,folderId:folderId || null})});
    const result = await response.json();
    setMovingId(null);
    if (!response.ok) { setFolderMessage(result.error || "Could not move conversation."); return; }
    setItems(current=>current.map(item=>item.id===conversationId?{...item,folder_id:result.conversation.folder_id}:item));
  }

  return <div className="library-layout">
    <aside className="library-sidebar">
      <span className="preview-label">YOUR LIBRARY</span>
      <button type="button" className={selectedFolder==="all"?"library-folder active":"library-folder"} onClick={()=>setSelectedFolder("all")}>All conversations <b>{items.length}</b></button>
      {folders.map(folder=><button type="button" className={selectedFolder===folder.id?"library-folder active":"library-folder"} key={folder.id} onClick={()=>setSelectedFolder(folder.id)}><span style={{background:folder.color}}/> {folder.name}</button>)}
      <form className="folder-create" onSubmit={createFolder}>
        <input aria-label="New folder name" value={folderName} onChange={e=>setFolderName(e.target.value)} placeholder="New folder name" maxLength={80} required/>
        <button type="submit" disabled={creating || !folderName.trim()}>{creating ? "…" : "+ Add folder"}</button>
      </form>
      {folderMessage && <p className="sidebar-note" role="status">{folderMessage}</p>}
      <p className="sidebar-note">Choose a folder to filter your archive. You can move conversations between folders at any time.</p>
    </aside>
    <section className="library-content">
      <div className="library-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search saved conversations…"/></div>
      {visibleItems.length ? <div className="conversation-grid">{visibleItems.map(item=><article className="conversation-card" key={item.id}>
        <span className="preview-tag">{item.tags?.[0] || "SAVED CHAT"}</span>
        <Link href={`/library/${item.id}`} className="conversation-card-link"><h2>{item.title}</h2><p>{item.summary || "Saved conversation. Open it to review the content."}</p><small>Saved {new Date(item.saved_at).toLocaleDateString()}</small><span className="open-conversation">Open conversation →</span></Link>
        <label className="conversation-folder-control">Folder
          <select aria-label={`Move ${item.title} to folder`} value={item.folder_id || ""} disabled={movingId===item.id} onChange={e=>moveConversation(item.id,e.target.value)}>
            <option value="">Unfiled</option>
            {folders.map(folder=><option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>
        </label>
      </article>)}</div> : <div className="empty-state"><div className="empty-icon">⌁</div><h2>{query ? "No matching conversations" : selectedFolder==="all" ? "Your library starts here." : "This folder is empty."}</h2><p>{query ? "Try a different search term." : "Save a ChatGPT conversation or move an existing one into this folder."}</p>{!query && <a className="primary-button" href="/save">Save your first conversation <span>→</span></a>}</div>}
    </section>
  </div>;
}
