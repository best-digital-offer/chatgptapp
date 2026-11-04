import { APP_ORIGIN, MCP_RESOURCE } from "@/lib/oauth";
export const runtime = "nodejs";
export async function GET() {
 return Response.json({
  resource: MCP_RESOURCE,
  authorization_servers: [APP_ORIGIN],
  bearer_methods_supported: ["header"],
  scopes_supported: ["conversations:read","conversations:write"],
  resource_documentation: `${APP_ORIGIN}/support`
 }, {headers:{"Cache-Control":"public, max-age=300"}});
}
