"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SavePage() {
  const [title,setTitle]=useState("");
  const [summary,setSummary]=useState("");
  const [content,setContent]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response=await fetch("/api/conversations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,summary,content})});
    const result=await response.json();
    setBusy(false);
    if(!response.ok){setMessage(result.error || "Unable to save this conversation.");return;}
    window.location.assign("/library");
  }
  return <main className="auth-shell"><Link className="brand" href="/library"><span className="brand-mark">S</span><span>samewindow</span><span className="brand-product">for ChatGPT</span></Link><section className="save-panel"><span className="eyebrow">ADD TO YOUR LIBRARY</span><h1 className="auth-title">Save a conversation.</h1><p className="auth-copy">Paste the conversation content you want to keep. SameWindow only stores what you submit here.</p><form className="auth-form" onSubmit={submit}><label>Conversation title<input required maxLength={240} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give this conversation a title"/></label><label>Short note (optional)<input value={summary} onChange={e=>setSummary(e.target.value)} placeholder="What should you remember about it?"/></label><label>Conversation content<textarea required rows={12} value={content} onChange={e=>setContent(e.target.value)} placeholder="Paste the conversation text here…"/></label>{message && <p className="form-error">{message}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy?"Saving…":"Save conversation"} <span>→</span></button></form></section></main>;
}
