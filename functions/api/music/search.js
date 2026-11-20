const json = (data, status = 200) => new Response(JSON.stringify(data), { 
  status, 
  headers: { 
    "content-type": "application/json; charset=utf-8", 
    "cache-control": "no-cache" // Temporarily disable caching for debugging
  } 
});

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
  
  if (!q) return json({ results: [], message: "Enter a song, artist or album." });
  
  try {
    // 1. Deezer
    const deezerUrl = new URL("https://api.deezer.com/search");
    deezerUrl.search = new URLSearchParams({ q: q, limit: "18" });
    
    const response = await fetch(deezerUrl, {
      headers: { "User-Agent": "NEXORA/0.2" }
    });
    
    const data = await response.json();
    
    const results = (data.data || []).map((item) => ({
      id: String(item.id),
      title: item.title,
      artist: item.artist.name,
      album: item.album.title || "",
      artwork: item.album.cover_xl || item.album.cover_big || "",
      preview: item.preview || null,
      provider: "Deezer",
      providerUrl: item.link || "https://www.deezer.com/",
      kind: "mainstream"
    }));
    
    // 2. Jamendo
    let jamendoDebug = "Not started";
    
    if (env.JAMENDO_CLIENT_ID) {
      jamendoDebug = "Key found: " + env.JAMENDO_CLIENT_ID;
      const jamendoUrl = new URL("https://api.jamendo.com/v3.0/tracks/");
      jamendoUrl.search = new URLSearchParams({ 
        client_id: env.JAMENDO_CLIENT_ID, 
        format: "json", 
        limit: "12", 
        search: q, 
        include: "musicinfo", 
        audioformat: "mp31" 
      });
      
      const jr = await fetch(jamendoUrl, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" 
        }
      });
      
      if (jr.ok) {
        const jd = await jr.json();
        if (jd.headers && jd.headers.status === "failed") {
          jamendoDebug = "Jamendo Rejected: " + jd.headers.error_message;
        } else {
          jamendoDebug = "Success! Found " + (jd.results ? jd.results.length : 0) + " tracks.";
          for (const item of jd.results || []) {
            results.push({
              id: "jamendo-" + item.id, 
              title: item.name, 
              artist: item.artist_name,
              album: item.album_name || "", 
              artwork: item.album_image || item.image || "",
              preview: item.audio || null, 
              provider: "Jamendo (independent)",
              providerUrl: item.shareurl || "https://www.jamendo.com/", 
              kind: "independent",
              license: item.license_ccurl || null
            });
          }
        }
      } else {
        jamendoDebug = "HTTP Error: " + jr.status;
      }
    } else {
      jamendoDebug = "ERROR: JAMENDO_CLIENT_ID is missing from Cloudflare Variables!";
    }
    
    return json({ results, count: results.length, jamendo_debug: jamendoDebug });
    
  } catch (error) {
    return json({ results: [], error: error.message }, 500);
  }
}