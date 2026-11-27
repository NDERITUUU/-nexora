const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=60"}});
export async function onRequestGet({env}) {
 if(!env.NEXORA_KV)return json({results:[],message:"Daily discovery storage is not connected yet."});
 try{const data=await env.NEXORA_KV.get("daily:discoveries","json");if(!data)return json({results:[],message:"The first scheduled daily refresh has not run yet."});return json(data)}
 catch(e){console.error("Daily discovery read failed",e);return json({results:[],message:"Daily discoveries are temporarily unavailable."},503)}
}