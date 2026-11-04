"use client";
import { useEffect,useState } from "react";
type Connection={client_id:string;client_name:string;connected_at:string;latest_token_expiry:string};
export function ConnectionsClient() {
 const [items,setItems]=useState<Connection[]>([]);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState("");
 async function load(){const r=await fetch("/api/connections");const d=await r.json();if(!r.ok){setError(d.error||"Unable to load connections.");return;}setItems(d.connections||[]);}
 useEffect(()=>{load();},[]);
 async function revoke(id:string){if(!window.confirm("Revoke this app's access to your SameWindow archive?"))return;setBusy(id);const r=await fetch("/api/connections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({client_id:id})});setBusy("");if(!r.ok){setError("Unable to revoke access. Please try again.");return;}await load();}
 return <div className="connections-list">{error&&<p className="form-error">{error}</p>}{items.length?items.map(item=><article className="connection-card" key={item.client_id}><div><h2>{item.client_name}</h2><p>Connected {new Date(item.connected_at).toLocaleString()}</p></div><button className="danger-button" disabled={busy===item.client_id} onClick={()=>revoke(item.client_id)}>{busy===item.client_id?"Revoking…":"Revoke access"}</button></article>):<p className="auth-copy">No active third-party connections.</p>}</div>;
}
