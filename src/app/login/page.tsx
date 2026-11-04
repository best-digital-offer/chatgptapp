"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const result = await authClient.signIn.email({ email, password, callbackURL: "/library" });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Unable to sign in. Check your details."); return; }
    window.location.assign("/library");
  }

  return <main className="auth-shell"><Link className="brand" href="/"><span className="brand-mark">S</span><span>samewindow</span><span className="brand-product">for ChatGPT</span></Link><section className="auth-panel"><span className="eyebrow">WELCOME BACK</span><h1 className="auth-title">Your library<br/><em>is waiting.</em></h1><p className="auth-copy">Sign in to return to the conversations you chose to keep.</p><form className="auth-form" onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></label>{error && <p className="form-error">{error}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <span>→</span></button></form><p className="auth-switch">New to SameWindow? <Link href="/signup">Create an account</Link></p><p className="auth-foot">Your archive is private to your account.</p></section></main>;
}
