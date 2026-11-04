import { APP_ORIGIN, MCP_RESOURCE } from "@/lib/oauth";
export const runtime = "nodejs";
export async function GET() {
 return Response.json({
  issuer: APP_ORIGIN,
  authorization_endpoint: `${APP_ORIGIN}/api/oauth/authorize`,
  token_endpoint: `${APP_ORIGIN}/api/oauth/token`,
  registration_endpoint: `${APP_ORIGIN}/api/oauth/register`,
  revocation_endpoint: `${APP_ORIGIN}/api/oauth/revoke`,
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code","refresh_token"],
  code_challenge_methods_supported: ["S256"],
  token_endpoint_auth_methods_supported: ["none"],
  scopes_supported: ["conversations:read","conversations:write"],
  authorization_response_iss_parameter_supported: true,
  client_id_metadata_document_supported: false,
  service_documentation: `${APP_ORIGIN}/support`,
  resource: MCP_RESOURCE
 }, {headers:{"Cache-Control":"public, max-age=300"}});
}
