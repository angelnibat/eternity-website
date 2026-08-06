
const DEFAULT_CONFIG = {"title": "ETERNITY", "subtitle": "OUT OF MY MIND OUT NOW", "listenNowText": "LISTEN NOW", "listenNowUrl": "https://share.amuse.io/track/eternity-out-of-my-mind", "logoUrl": "./logo.png", "desktopVideoUrl": "assets/background.webm", "mobileVideoUrl": "assets/background-mobile.mp4", "spotifyUrl": "https://open.spotify.com/artist/3qOjyHpRml1BGPMsdsbRnq", "youtubeUrl": "https://www.youtube.com/channel/UCniFldjrUruHiABSdLc5PbQ", "twitterUrl": "https://x.com/Eternitygrls", "discordUrl": "https://discord.gg/TuxwmxqcVx", "instagramUrl": "https://www.instagram.com/Eternitygrls", "videoVisible": true, "videoEyebrow": "NOW PLAYING", "videoTitle": "CHECK OUT OUR LATEST VIDEO", "youtubeVideoUrl": "https://www.youtube.com/watch?v=FrB7TeNOl9g", "aboutVisible": true, "aboutEyebrow": "ABOUT US", "aboutHeading": "More than a girl group.", "aboutParagraph1": "Built from late nights, setbacks, and unwavering faith, Eternity is proof that dreams don't have an expiration date. With no major company, no shortcuts, and no one to pave the way, these girls fought through every hardship together—turning rejection into motivation and struggles into strength.", "aboutParagraph2": "Every performance, every practice, and every sacrifice led to this moment. Their debut isn't just the beginning of a girl group—it's the start of a legacy built on resilience, sisterhood, and passion.", "aboutQuote": "“They didn't wait for someone else to believe in them. They believed in themselves.”", "aboutClosing": "This is Eternity. And this is only the beginning. ✨"};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function isAuthorized(request, env) {
  const header = request.headers.get("authorization") || "";
  return Boolean(env.ADMIN_TOKEN) && header === `Bearer ${env.ADMIN_TOKEN}`;
}

export async function onRequestGet(context) {
  const stored = await context.env.SITE_CONFIG.get("website", "json");
  return json({ ...DEFAULT_CONFIG, ...(stored || {}) });
}

export async function onRequestPut(context) {
  if (!isAuthorized(context.request, context.env)) {
    return json({ error: "Unauthorized" }, 401);
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json({ error: "Configuration must be an object." }, 400);
  }

  const allowedKeys = new Set(Object.keys(DEFAULT_CONFIG));
  const clean = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!allowedKeys.has(key)) continue;
    if (typeof DEFAULT_CONFIG[key] === "boolean") {
      clean[key] = Boolean(value);
    } else {
      clean[key] = String(value ?? "").slice(0, 12000);
    }
  }

  const merged = { ...DEFAULT_CONFIG, ...clean };
  await context.env.SITE_CONFIG.put("website", JSON.stringify(merged));
  return json(merged);
}
