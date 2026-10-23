// Shared check: the dashboard sends the ADMIN_KEY in the x-admin-key header.
const same = (a, b) => {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};
// Password is ADMIN_KEY. If ADMIN_USER is also set, the username must match as well.
export function authorised(req) {
  const user = Netlify.env.get("ADMIN_USER");
  if (user && !same(user, req.headers.get("x-admin-user") || "")) return false;
  return same(Netlify.env.get("ADMIN_KEY"), req.headers.get("x-admin-key") || "");
}
export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
