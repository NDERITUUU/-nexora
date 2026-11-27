const QUERIES=["Kenyan music","Afrobeats hits","East African music","African gospel","global pop hits","hip hop new releases","R&B hits","independent music"];
async function fetchDeezer(query){
 const url=new URL("https://api.deezer.com/search");url.search=new URLSearchParams({q:query,limit:"12"});
 const response=await fetch(url,{headers:{"User-Agent":"NEXORA-Daily-Discovery/1.0"}});
 if(!response.ok)throw new Error("Deezer returned "+response.status);
 const data=await response.json();
 return (data.data||[]).map(t=>({id:"dz-"+t.id,title:t.title,artist:t.artist?.name||"Unknown",album:t.album?.title||"",artwork:t.album?.cover_xl||t.album?.cover_big||"",preview:t.preview||null,provider:"Deezer",providerUrl:t.link||"https://www.deezer.com/",kind:"mainstream"}));
}
export default {
 async scheduled(controller,env,ctx){
  if(!env.NEXORA_KV)throw new Error("Bind the NEXORA_KV namespace before enabling the cron.");
  const groups=await Promise.all(QUERIES.map(async q=>({query:q,tracks:await fetchDeezer(q)})));
  const seen=new Set(),results=[];
  for(const group of groups)for(const track of group.tracks){const key=track.id;if(!seen.has(key)){seen.add(key);results.push({...track,category:group.query})}}
  const payload={updatedAt:new Date().toISOString(),count:results.length,results};
  await env.NEXORA_KV.put("daily:discoveries",JSON.stringify(payload));
  await env.NEXORA_KV.put("daily:last-success",payload.updatedAt);
 },
 async fetch(){return new Response("NEXORA daily music refresh worker. Scheduled execution only.",{headers:{"content-type":"text/plain"}})}
};