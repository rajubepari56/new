// Shared check: the dashboard sends the ADMIN_KEY in the x-admin-key header.
export function authorised(req) {
  const key = Netlify.env.get("ADMIN_KEY");
  const sent = req.headers.get("x-admin-key") || "";
  if (!key || sent.length !== key.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ sent.charCodeAt(i);
  return diff === 0;
}
export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
