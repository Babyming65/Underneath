// Vercel serverless function: GET /api/instagram
// Reads the latest posts from your Instagram account. The token stays on the server.
module.exports = async (req, res) => {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "IG_ACCESS_TOKEN is not set" });

  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=30&access_token=${token}`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok || data.error) {
      return res.status(502).json({ error: (data.error && data.error.message) || "Instagram request failed" });
    }
    // New posts show up within ~10 minutes
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    return res.status(200).json({ posts: data.data || [] });
  } catch (e) {
    return res.status(502).json({ error: "Could not reach Instagram" });
  }
};
