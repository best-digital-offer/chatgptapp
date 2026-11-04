import { db } from "@/lib/db";
import { MCP_RESOURCE, validateBearer } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tools = [
 {name:"search_saved_conversations",description:"Search the signed-in user's SameWindow archive. Returns matching saved conversation titles, summaries, tags, dates and IDs. Does not search or import unsaved ChatGPT history.",inputSchema:{type:"object",properties:{query:{type:"string",description:"Words or phrase to search for."},limit:{type:"integer",minimum:1,maximum:25,default:10}},required:["query"],additionalProperties:false}},
 {name:"get_saved_conversation",description:"Retrieve the full content of one conversation previously saved in the signed-in user's SameWindow archive.",inputSchema:{type:"object",properties:{conversation_id:{type:"string",description:"ID returned by search_saved_conversations."}},required:["conversation_id"],additionalProperties:false}},
 {name:"save_conversation",description:"Save conversation content explicitly provided by the user into their SameWindow archive. Only call when the user asks to save or archive the supplied content.",inputSchema:{type:"object",properties:{title:{type:"string",maxLength:240},content:{type:"string",maxLength:500000},summary:{type:"string",maxLength:2000},tags:{type:"array",items:{type:"string",maxLength:50},maxItems:20},folder_id:{type:"string"}},required:["title","content"],additionalProperties:false}},
 {name:"list_folders",description:"List folders in the signed-in user's SameWindow archive.",inputSchema:{type:"object",properties:{},additionalProperties:false}}
];

function result(id:unknown, value:unknown) {
 return Response.json({jsonrpc:"2.0",id,result:value},{headers:{"Cache-Control":"no-store","Content-Type":"application/json"}});
}
function rpcError(id:unknown, code:number, message:string) {
 return Response.json({jsonrpc:"2.0",id,error:{code,message}},{headers:{"Cache-Control":"no-store","Content-Type":"application/json"}});
}
function textResult(value:unknown) {
 return {content:[{type:"text",text:JSON.stringify(value)}],structuredContent:value,isError:false};
}
export async function GET() {
 return new Response("SameWindow MCP endpoint. Use Streamable HTTP POST.",{status:405,headers:{"Allow":"POST","Content-Type":"text/plain"}});
}
export async function POST(request:Request) {
 const token=await validateBearer(request);
 if(!token) return Response.json({error:"unauthorized"},{status:401,headers:{"WWW-Authenticate":`Bearer resource_metadata="${new URL("/.well-known/oauth-protected-resource",MCP_RESOURCE).toString()}"`,"Cache-Control":"no-store"}});
 const body=await request.json().catch(()=>null);
 if(!body || body.jsonrpc!=="2.0" || typeof body.method!=="string") return rpcError(body?.id??null,-32600,"Invalid JSON-RPC request.");
 const id=body.id;
 if(body.method==="notifications/initialized" || body.method==="notifications/cancelled") return new Response(null,{status:202});
 if(body.method==="initialize") return result(id,{protocolVersion:body.params?.protocolVersion || "2025-03-26",capabilities:{tools:{listChanged:false}},serverInfo:{name:"samewindow",title:"SameWindow for ChatGPT",version:"1.0.0"},instructions:"You can search and retrieve only conversations the user explicitly saved in SameWindow. Do not imply access to unsaved ChatGPT history. Save content only when the user explicitly asks."});
 if(body.method==="ping") return result(id,{});
 if(body.method==="tools/list") return result(id,{tools});
 if(body.method!=="tools/call") return rpcError(id,-32601,"Method not found.");
 const name=body.params?.name;
 const args=body.params?.arguments || {};
 const canRead=token.scope.split(/\\s+/).includes("conversations:read");
 const canWrite=token.scope.split(/\\s+/).includes("conversations:write");
 try {
  if(name==="search_saved_conversations") {
   if(!canRead) return result(id,textResult({error:"Insufficient scope: conversations:read"}));
   const query=typeof args.query==="string"?args.query.trim():"";
   if(!query) return result(id,textResult({error:"A search query is required."}));
   const limit=Math.min(25,Math.max(1,Number.isInteger(args.limit)?args.limit:10));
   const rows=await db`SELECT id,title,summary,tags,saved_at FROM public.saved_conversations WHERE user_id=${token.userId} AND (title ILIKE ${"%"+query+"%"} OR coalesce(summary,'') ILIKE ${"%"+query+"%"} OR coalesce(content,'') ILIKE ${"%"+query+"%"}) ORDER BY saved_at DESC LIMIT ${limit}`;
   return result(id,textResult({count:rows.length,conversations:rows}));
  }
  if(name==="get_saved_conversation") {
   if(!canRead) return result(id,textResult({error:"Insufficient scope: conversations:read"}));
   const conversationId=typeof args.conversation_id==="string"?args.conversation_id:"";
   const rows=await db`SELECT id,title,content,summary,tags,saved_at FROM public.saved_conversations WHERE id=${conversationId} AND user_id=${token.userId} LIMIT 1`;
   if(!rows.length) return result(id,textResult({error:"Saved conversation not found."}));
   return result(id,textResult({conversation:rows[0]}));
  }
  if(name==="save_conversation") {
   if(!canWrite) return result(id,textResult({error:"Insufficient scope: conversations:write"}));
   const title=typeof args.title==="string"?args.title.trim():"";
   const content=typeof args.content==="string"?args.content.trim():"";
   if(!title || title.length>240 || !content || content.length>500000) return result(id,textResult({error:"A title and content (maximum 500 KB) are required."}));
   const summary=typeof args.summary==="string"?args.summary.slice(0,2000):null;
   const tags=Array.isArray(args.tags)?args.tags.filter((x:unknown):x is string=>typeof x==="string").slice(0,20):[];
   const folderId=typeof args.folder_id==="string"?args.folder_id:null;
   if(folderId) {
    const folder=await db`SELECT id FROM public.folders WHERE id=${folderId} AND user_id=${token.userId} LIMIT 1`;
    if(!folder.length) return result(id,textResult({error:"Folder not found in your archive."}));
   }
   const rows=await db`INSERT INTO public.saved_conversations(user_id,folder_id,title,content,summary,tags,source) VALUES(${token.userId},${folderId},${title},${content},${summary},${tags},'chatgpt') RETURNING id,title,summary,tags,saved_at`;
   return result(id,textResult({saved:true,conversation:rows[0]}));
  }
  if(name==="list_folders") {
   if(!canRead) return result(id,textResult({error:"Insufficient scope: conversations:read"}));
   const rows=await db`SELECT id,name,color,created_at FROM public.folders WHERE user_id=${token.userId} ORDER BY created_at ASC`;
   return result(id,textResult({folders:rows}));
  }
  return rpcError(id,-32602,"Unknown tool or invalid arguments.");
 } catch {
  return result(id,{...textResult({error:"The requested archive operation failed. Please try again."}),isError:true});
 }
}
