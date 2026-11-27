# NEXORA

NEXORA is a mobile-first music discovery progressive web app (PWA).

## Included in this release
- Mobile-first music discovery and search interface.
- Deezer catalogue search, album artwork and previews where supplied.
- Optional Jamendo independent catalogue integration.
- Optional Cloudflare KV caching for search.
- Daily discovery API endpoint and scheduled music-refresh Worker.
- Kenya/East Africa, Afrobeats, hip-hop, R&B, gospel and global-pop discovery shortcuts.
- Browser voice search where supported.
- PWA installation and improved offline app-shell caching.
- User-controlled artwork download.

## Cloudflare Pages configuration
1. Keep this repository connected to your Cloudflare Pages project. GitHub pushes trigger a new Pages deployment.
2. In Cloudflare Dashboard → Workers & Pages → KV, create a KV namespace named **NEXORA_KV**.
3. In Pages → NEXORA project → Settings → Functions → KV namespace bindings, add binding **NEXORA_KV** and select that namespace.
4. Optional: set **JAMENDO_CLIENT_ID** as a Pages environment variable only after checking Jamendo's current API and commercial-use terms.
5. Redeploy the Pages project after adding bindings.

## Enable the daily music refresh
The scheduled Worker source is `workers/music-refresh.js`; its schedule is in `wrangler.music-refresh.toml`.
1. Copy the KV namespace ID from the namespace created above.
2. Replace `REPLACE_WITH_YOUR_CLOUDFLARE_KV_NAMESPACE_ID` in `wrangler.music-refresh.toml` with the actual ID.
3. Deploy the Worker from a computer with Wrangler installed: `npx wrangler deploy --config wrangler.music-refresh.toml`.
4. Confirm the Worker has the **NEXORA_KV** binding pointing to the same KV namespace.
5. The cron runs daily at **04:37 UTC (07:37 East Africa Time)**. The daily shelf populates after the first successful run.
6. Confirm `/api/music/discover` returns a non-empty `results` array after the Worker runs.

The scheduled daily shelf currently uses Deezer catalogue discovery. Jamendo remains an optional search source because track licences and API commercial-use terms must be checked before monetisation or redistribution.

## Music rights and product limits
- Metadata and short previews do not grant rights to stream full tracks.
- Full listening opens the authorised provider page. NEXORA does not bypass subscriptions, advertisements, DRM or geographic restrictions.
- Jamendo API commercial-use terms and individual track licences vary; obtain required permission before monetising or redistributing music.
- Artwork is downloaded only at the user's request; check source terms and use it appropriately.
- Voice search relies on browser Web Speech API and microphone permissions.
- The music guide is a search helper, not a generative AI assistant.
- A real AI assistant needs a model/API, server-side secret, usage controls and potentially paid usage.
- A website cannot silently set Android wallpaper or control arbitrary phone settings.
