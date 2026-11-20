const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" } });

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
  if (!q) return json({ results: [], message: "Enter a song, artist or album." });
  try {
    const itunesUrl = new URL("https://itunes.apple.com/search");
    itunesUrl.search = new URLSearchParams({ term: q, entity: "song", limit: "18" });
    const response = await fetch(itunesUrl, { headers: { "User-Agent": "NEXORA/0.2 (music discovery)" } });
    if (!response.ok) throw new Error("Music catalogue is temporarily unavailable.");
    const data = await response.json();
    const results = (data.results || []).map((item) => ({
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName || "",
      artwork: (item.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
      preview: item.previewUrl || null,
      provider: "Apple Music catalogue",
      providerUrl: item.trackViewUrl || item.collectionViewUrl || "https://music.apple.com/",
      kind: "mainstream"
    }));
    
    // Jamendo is optional. Add its independent catalogue only after the owner
    // supplies a Jamendo API client ID and accepts the provider's licence terms.
    if (env.JAMENDO_CLIENT_ID) {
      const jamendoUrl = new URL("https://api.jamendo.com/v3.0/tracks/");
      jamendoUrl.search = new URLSearchParams({ client_id: env.JAMENDO_CLIENT_ID, format: "json", limit: "12", search: q, include: "musicinfo", audioformat: "mp31" });
      const jr = await fetch(jamendoUrl);
      if (jr.ok) {
        const jd = await jr.json();
        for (const item of jd.results || []) results.push({
          id: "jamendo-" + item.id, title: item.name, artist: item.artist_name,
          album: item.album_name || "", artwork: item.album_image || item.image || "",
          preview: item.audio || null, provider: "Jamendo (independent)",
          providerUrl: item.shareurl || "https://www.jamendo.com/", kind: "independent",
          license: item.license_ccurl || null
        });
      }
    }
    return json({ results, count: results.length });
  } catch (error) {
    return json({ results: [], error: error.message || "Search failed. Please try again." }, 502);
  }
}