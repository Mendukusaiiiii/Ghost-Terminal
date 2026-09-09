
export default async function handler(req, res) {
  const target = process.env.GOOGLE_SCRIPT_URL;

  if (!target) {
    res.status(500).json({ error: "GOOGLE_SCRIPT_URL is not configured" });
    return;
  }

  try {
    if (req.method === "HEAD") {
      const upstream = await fetch(target, { method: "HEAD" });
      res.status(upstream.status).end();
      return;
    }

    if (req.method === "GET") {
      const upstream = await fetch(target);
      const body = await upstream.text();
      res
        .status(upstream.status)
        .setHeader(
          "Content-Type",
          upstream.headers.get("content-type") || "application/json"
        )
        .send(body);
      return;
    }

    if (req.method === "POST") {
   
      const params = new URLSearchParams();
      const body = req.body || {};
      for (const key of Object.keys(body)) {
        params.append(key, body[key]);
      }

      const upstream = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
      const text = await upstream.text();
      res.status(upstream.status).send(text);
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Upstream request failed" });
  }
}
