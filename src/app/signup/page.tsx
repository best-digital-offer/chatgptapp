"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export default function SignupPage() {
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const result = await authClient.signUp.email({ name, email, password, callbackURL: "/library" });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Unable to create your account."); return; }
    window.location.assign("/library");
  }

  return <main className="auth-shell"><Link className="brand" href="/"><span className="brand-mark">S</span><span>samewindow</span><span className="brand-product">for ChatGPT</span></Link><section className="auth-panel"><span className="eyebrow">START YOUR PRIVATE ARCHIVE</span><h1 className="auth-title">Keep your best<br/><em>thinking close.</em></h1><p className="auth-copy">Create your account and start saving the conversations that matter.</p><form className="auth-form" onSubmit={submit}><label>Your name<input autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>{error && <p className="form-error">{error}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy ? "Creating account…" : "Create account"} <span>→</span></button></form><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p><p className="auth-foot">You choose what to save. Nothing is imported automatically.</p></section></main>;
}
