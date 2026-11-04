"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Conversation = { id:string; title:string; summary:string|null; tags:string[]; folder_id:string|null; saved_at:string };
type Folder = { id:string; name:string; color:string };

export function LibraryClient({initialConversations,folders:initialFolders}:{initialConversations:Conversation[];folders:Folder[]}) {
  const [query,setQuery] = useState("");
  const [selectedFolder,setSelectedFolder] = useState("all");
  const [items,setItems] = useState(initialConversations);
  const [folders,setFolders] = useState(initialFolders);
  const [folderName,setFolderName] = useState("");
  const [folderMessage,setFolderMessage] = useState("");
  const [creating,setCreating] = useState(false);
  const [movingId,setMovingId] = useState<string|null>(null);
  const [editingFolder,setEditingFolder] = useState<string|null>(null);
  const [editingName,setEditingName] = useState("");

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
    () => selectedFolder === "all" ? items : selectedFolder === "unfiled" ? items.filter(item=>!item.folder_id) : items.filter(item => item.folder_id === selectedFolder),
    [items,selectedFolder]
  );
  const unfiledCount = items.filter(item=>!item.folder_id).length;

  async function createFolder(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true); setFolderMessage("");
    try {
      const response = await fetch("/api/folders", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:folderName})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create folder.");
      setFolders(current=>[...current,result.folder]); setFolderName(""); setSelectedFolder(result.folder.id);
    } catch(error) { setFolderMessage(error instanceof Error ? error.message : "Could not create folder."); }
    finally { setCreating(false); }
  }

  async function moveConversation(conversationId:string, folderId:string) {
    setMovingId(conversationId); setFolderMessage("");
    try {
      const response = await fetch("/api/conversations",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId,folderId:folderId || null})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not move conversation.");
      setItems(current=>current.map(item=>item.id===conversationId?{...item,folder_id:result.conversation.folder_id}:item));
    } catch(error) { setFolderMessage(error instanceof Error ? error.message : "Could not move conversation."); }
    finally { setMovingId(null); }
  }

  async function saveFolderName(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editingFolder) return;
    const name=editingName.trim(); if (!name) return;
    const response=await fetch("/api/folders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editingFolder,name})});
    const result=await response.json();
    if (!response.ok) { setFolderMessage(result.error || "Could not rename folder."); return; }
    setFolders(current=>current.map(folder=>folder.id===editingFolder?result.folder:folder));
    setEditingFolder(null); setEditingName("");
  }

  async function deleteFolder(id:string) {
    if (!window.confirm("Delete this folder? Saved conversations will remain in your library as unfiled items.")) return;
    const response=await fetch("/api/folders",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    const result=await response.json();
    if (!response.ok) { setFolderMessage(result.error || "Could not delete folder."); return; }
    setFolders(current=>current.filter(folder=>folder.id!==id));
    setItems(current=>current.map(item=>item.folder_id===id?{...item,folder_id:null}:item));
    if (selectedFolder===id) setSelectedFolder("all");
  }

  return <div className="workspace-layout">
    <aside className="workspace-sidebar">
      <div className="workspace-sidebar-heading"><span>WORKSPACE</span><span className="workspace-live-dot"/></div>
      <button type="button" className={selectedFolder==="all"?"workspace-nav-item selected":"workspace-nav-item"} onClick={()=>setSelectedFolder("all")}><span className="workspace-nav-icon">▦</span><span>All conversations</span><b>{items.length}</b></button>
      <button type="button" className={selectedFolder==="unfiled"?"workspace-nav-item selected":"workspace-nav-item"} onClick={()=>setSelectedFolder("unfiled")}><span className="workspace-nav-icon">◷</span><span>Unfiled</span><b>{unfiledCount}</b></button>
      <div className="workspace-folder-heading"><span>MY FOLDERS</span><span>{folders.length}</span></div>
      <div className="workspace-folder-list">
        {folders.map(folder=><div className={selectedFolder===folder.id?"workspace-folder-row active":"workspace-folder-row"} key={folder.id}>
          {editingFolder===folder.id ? <form className="folder-rename-form" onSubmit={saveFolderName}><input autoFocus value={editingName} onChange={e=>setEditingName(e.target.value)} maxLength={80}/><button type="submit" aria-label="Save folder name">✓</button><button type="button" aria-label="Cancel rename" onClick={()=>setEditingFolder(null)}>×</button></form> :
          <><button type="button" className="workspace-folder-select" onClick={()=>setSelectedFolder(folder.id)}><span className="workspace-folder-icon" style={{color:folder.color}}>▰</span><span>{folder.name}</span><b>{items.filter(item=>item.folder_id===folder.id).length}</b></button><div className="workspace-folder-actions"><button type="button" title="Rename folder" onClick={()=>{setEditingFolder(folder.id);setEditingName(folder.name);}}>✎</button><button type="button" title="Delete folder" onClick={()=>deleteFolder(folder.id)}>×</button></div></>}
        </div>)}
      </div>
      <form className="workspace-create-folder" onSubmit={createFolder}><input aria-label="New folder name" value={folderName} onChange={e=>setFolderName(e.target.value)} placeholder="Create a folder…" maxLength={80} required/><button type="submit" disabled={creating || !folderName.trim()}>{creating?"…":"+"}</button></form>
      {folderMessage && <p className="workspace-feedback" role="status">{folderMessage}</p>}
      <div className="workspace-sidebar-footer"><span className="workspace-lock">⌑</span><span>Your archive is private to your account.</span></div>
    </aside>

    <section className="workspace-main">
      <div className="workspace-toolbar"><div className="workspace-breadcrumb">SameWindow <span>/</span> <strong>{selectedFolder==="all"?"All conversations":selectedFolder==="unfiled"?"Unfiled":folders.find(folder=>folder.id===selectedFolder)?.name || "Folder"}</strong></div><div className="workspace-toolbar-actions"><span className="workspace-status"><i/> Synced to your account</span><Link href="/settings/connections" className="workspace-icon-button" title="Settings">⚙</Link></div></div>
      <div className="workspace-page-heading"><div><span className="eyebrow">YOUR PRIVATE ARCHIVE</span><h1>{selectedFolder==="all"?"Your conversations":selectedFolder==="unfiled"?"Unfiled conversations":folders.find(folder=>folder.id===selectedFolder)?.name || "Folder"}</h1><p>Keep the conversations, ideas and context you want to return to.</p></div><Link className="workspace-primary-button" href="/save"><span>＋</span> Save conversation</Link></div>
      <div className="workspace-search-row"><label className="workspace-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search titles, topics and saved content…"/><kbd>⌘ K</kbd></label><span className="workspace-results-count">{visibleItems.length} {visibleItems.length===1?"conversation":"conversations"}</span></div>
      {visibleItems.length ? <div className="workspace-conversation-list">{visibleItems.map(item=><article className="workspace-conversation-card" key={item.id}>
        <div className="workspace-card-symbol">▤</div><div className="workspace-card-content"><div className="workspace-card-meta"><span>{item.tags?.[0] || "SAVED CONVERSATION"}</span><span>·</span><time>{new Date(item.saved_at).toLocaleDateString()}</time></div><Link href={`/library/${item.id}`}><h2>{item.title}</h2></Link><p>{item.summary || "Open this saved conversation to review the full content."}</p><div className="workspace-card-footer"><label>Folder <select aria-label={`Move ${item.title} to folder`} value={item.folder_id || ""} disabled={movingId===item.id} onChange={e=>moveConversation(item.id,e.target.value)}><option value="">Unfiled</option>{folders.map(folder=><option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label><Link href={`/library/${item.id}`} className="workspace-open-link">Open conversation <span>→</span></Link></div></div>
      </article>)}</div> : <div className="workspace-empty"><div className="workspace-empty-icon">▤</div><h2>{query?"No matching conversations":selectedFolder==="all"?"Your library is ready for its first conversation":"Nothing here yet"}</h2><p>{query?"Try another search term.":"Save a conversation you want to keep, then organize it here with folders."}</p>{!query && <Link className="workspace-primary-button" href="/save">＋ Save a conversation</Link>}</div>}
    </section>
  </div>;
}
