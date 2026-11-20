# NEXORA

NEXORA is a mobile-first music discovery and personal assistant foundation.

## Current build (0.2)
- Live music search through the Apple iTunes Search catalogue.
- Artwork, artist and album metadata.
- Short preview clips where the provider supplies them.
- Links to the authorised provider page for full listening.
- Optional Jamendo independent catalogue integration.
- Browser voice search (where supported).
- Downloadable artwork for the user to set as wallpaper manually.

## Deploy on Cloudflare Pages
1. Connect this repository to Cloudflare Pages (or let the existing Pages project deploy from GitHub).
2. Keep the `functions/` directory at the repository root. Cloudflare Pages automatically detects Pages Functions there.
3. Deploy. The search endpoint is `/api/music/search?q=...`.

## Optional independent music catalogue
1. Create an application at https://devportal.jamendo.com.
2. Review Jamendo's API and track-specific Creative Commons licence terms.
3. Add `JAMENDO_CLIENT_ID` as an environment variable/secret in the Cloudflare Pages project.
4. Redeploy.

Important: Jamendo's API commercial-use terms may require a separate commercial agreement, including where the service is monetised. Obtain written approval before using it commercially. Each track's licence must also be checked. Do not assume every track can be redistributed.

## Rights and product limits
- Apple catalogue search and short previews are not a substitute for a full music streaming licence.
- Full-track playback opens the provider's own page; NEXORA does not bypass subscriptions, ads, DRM or regional restrictions.
- Artwork is downloaded only when the user chooses; a website cannot silently change Android wallpaper.
- Voice search uses the browser's Web Speech API and depends on browser/device support.
- The assistant is a future stage; this build does not yet perform arbitrary phone actions or provide general AI reasoning.
