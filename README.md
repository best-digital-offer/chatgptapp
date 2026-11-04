# SameWindow for ChatGPT

Independent ChatGPT app and SaaS hosted exclusively at https://app.samewindow.com.

## Product boundary
This repository is separate from the existing SameWindow browser extensions and main marketing website. Do not modify or depend on their repositories, Supabase project, Paddle products, or Vercel project.

## Product promise
A user-controlled archive for conversations they explicitly choose to save from ChatGPT. The app does not claim automatic access to a user's complete ChatGPT history.

## Architecture
- Next.js App Router + TypeScript
- OpenAI Apps SDK UI, connected through a remote MCP server
- MCP endpoint: https://app.samewindow.com/mcp
- Separate Supabase project: proposed name `samewindow-chatgpt`
- Separate Paddle catalog and webhook configuration
- Separate Vercel project: `chatgptapp`
- Production origin: https://app.samewindow.com

## Approval strategy
Build and test as a custom MCP app first. Public directory submission is a separate review process and approval is not guaranteed. Follow current OpenAI Apps SDK, MCP authorization, directory, safety, privacy, and design requirements at implementation time.

## Current status
- GitHub repository created and confirmed empty before bootstrap.
- Cloudflare CNAME already exists: `app` -> `cname.vercel-dns.com`, DNS-only.
- Vercel project and separate Supabase project still need to be provisioned.
- No production secrets or credentials belong in this repository.

## Non-negotiable safeguards
1. Only use `app.samewindow.com` for this product.
2. Never change `samewindow.com` or the existing browser product.
3. Never reuse the browser product's Supabase project or Paddle product IDs.
4. Enforce ownership and plan limits on the server, not in model instructions.
5. Treat conversation content as private user data; collect only what the user explicitly saves.
6. Do not claim app-directory approval before OpenAI grants it.
