const api = {
  get: (url) => fetch(url).then((r) => r.json()),

  post: (url, body) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Request failed");
      return data;
    })
};

export default api;