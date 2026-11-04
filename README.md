# SameWindow for ChatGPT

Independent ChatGPT app and SaaS hosted at https://app.samewindow.com.

## Product promise
A user-controlled archive for conversations they explicitly choose to save from ChatGPT. The app does not claim automatic access to a user's complete ChatGPT history.

## Architecture
- Next.js App Router + TypeScript
- Remote MCP server endpoint: https://app.samewindow.com/api/mcp
- Separate Neon PostgreSQL database: samewindow_chatgpt
- Separate Vercel project: chatgptapp
- Production origin: https://app.samewindow.com

## MCP tools
- `search_saved_conversations`: searches only the authenticated user's saved archive.
- `get_saved_conversation`: retrieves one saved conversation owned by the authenticated user.
- `save_conversation`: saves content explicitly supplied by the user when they request it.
- `list_folders`: lists the authenticated user's folders.

The app uses OAuth 2.1 authorization code flow with PKCE S256. Access tokens are audience-bound to the MCP resource and stored as hashes. User ownership is enforced in database queries.

## Privacy and security boundaries
1. Only use `app.samewindow.com` for this product.
2. Never change the main SameWindow website or browser extensions from this repository.
3. Never reuse another SameWindow product's database or billing configuration.
4. Enforce ownership and scopes on the server.
5. Treat conversation content as private user data; collect only what the user explicitly saves.
6. Do not claim automatic access to unsaved ChatGPT history.
7. Do not claim app-directory approval before OpenAI grants it.

## Deployment
Vercel project: `chatgptapp`. Production domain: `app.samewindow.com`.
