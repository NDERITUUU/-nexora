const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const reply = (data, status=200, extra={}) => new Response(JSON.stringify(data), {status,headers:{...headers,...extra}});
const clean = v => typeof v === "string" ? v.trim().slice(0,160) : "";
export async function onRequestGet({request,env}) {
 const url=new URL(request.url),q=clean(url.searchParams.get("q"));
 if(!q)return reply({results:[],count:0,message:"Enter a song, artist or genre."});
 if(q.length<2)return reply({results:[],count:0,message:"Please enter at least two characters."});
 const cacheKey="search:"+q.toLowerCase();
 if(env.NEXORA_KV){try{const cached=await env.NEXORA_KV.get(cacheKey,"json");if(cached)return reply({...cached,cached:true});}catch(e){console.error("KV read failed",e)}}
 const results=[],seen=new Set();
 const add=item=>{const key=(item.title+"|"+item.artist).toLowerCase();if(!seen.has(key)){seen.add(key);results.push(item)}};
 const tasks=[(async()=>{const u=new URL("https://api.deezer.com/search");u.search=new URLSearchParams({q,limit:"24"});const r=await fetch(u,{headers:{"User-Agent":"NEXORA/1.0"}});if(!r.ok)throw Error("Deezer HTTP "+r.status);const d=await r.json();for(const x of d.data||[])add({id:"dz-"+x.id,title:x.title,artist:x.artist?.name||"Unknown",album:x.album?.title||"",artwork:x.album?.cover_xl||x.album?.cover_big||"",preview:x.preview||null,provider:"Deezer",providerUrl:x.link||"https://www.deezer.com/",kind:"mainstream"});})()];
 if(env.JAMENDO_CLIENT_ID)tasks.push((async()=>{const u=new URL("https://api.jamendo.com/v3.0/tracks/");u.search=new URLSearchParams({client_id:env.JAMENDO_CLIENT_ID,format:"json",limit:"15",search:q,include:"musicinfo",audioformat:"mp31"});const r=await fetch(u);if(!r.ok)throw Error("Jamendo HTTP "+r.status);const d=await r.json();for(const x of d.results||[])add({id:"jm-"+x.id,title:x.name,artist:x.artist_name,album:x.album_name||"",artwork:x.album_image||x.image||"",preview:x.audio||null,provider:"Jamendo",providerUrl:x.shareurl||"https://www.jamendo.com/",kind:"independent",license:x.license_ccurl||null});})());
 const settled=await Promise.allSettled(tasks);
 if(!results.length&&settled.every(x=>x.status==="rejected"))return reply({results:[],count:0,error:"Music catalogues are temporarily unavailable. Please try again."},502);
 const payload={results,count:results.length,cached:false};
 if(env.NEXORA_KV){try{await env.NEXORA_KV.put(cacheKey,JSON.stringify(payload),{expirationTtl:300});}catch(e){console.error("KV write failed",e)}}
 return reply(payload,200,{"cache-control":"public, max-age=60"});
}