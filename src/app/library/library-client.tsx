"use client";

import { useMemo, useState } from "react";

type Conversation = { id:string; title:string; summary:string|null; tags:string[]; folder_id:string|null; saved_at:string };
type Folder = { id:string; name:string; color:string };

export function LibraryClient({initialConversations,folders}:{initialConversations:Conversation[];folders:Folder[]}) {
  const [query,setQuery] = useState("");
  const [items] = useState(initialConversations);
  const filtered = useMemo(()=>items.filter(item => (item.title+" "+(item.summary||"")+" "+item.tags.join(" ")).toLowerCase().includes(query.toLowerCase())),[items,query]);
  return <div className="library-layout"><aside className="library-sidebar"><span className="preview-label">YOUR LIBRARY</span><div className="library-folder active">All conversations <b>{items.length}</b></div>{folders.map(folder=><div className="library-folder" key={folder.id}><span style={{background:folder.color}}/> {folder.name}</div>)}<p className="sidebar-note">Folders help you group saved conversations by project or topic.</p></aside><section className="library-content"><div className="library-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search saved conversations…"/></div>{filtered.length ? <div className="conversation-grid">{filtered.map(item=><article className="conversation-card" key={item.id}><span className="preview-tag">{item.tags?.[0] || "SAVED CHAT"}</span><h2>{item.title}</h2><p>{item.summary || "Saved conversation. Open it to review the content."}</p><small>Saved {new Date(item.saved_at).toLocaleDateString()}</small></article>)}</div> : <div className="empty-state"><div className="empty-icon">⌁</div><h2>{query ? "No matching conversations" : "Your library starts here."}</h2><p>{query ? "Try a different search term." : "Save a ChatGPT conversation to build your personal, searchable archive."}</p>{!query && <a className="primary-button" href="/save">Save your first conversation <span>→</span></a>}</div>}</section></div>;
}
