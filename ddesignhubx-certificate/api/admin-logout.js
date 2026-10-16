import { clearAdminCookie, send } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  clearAdminCookie(res);
  return send(res, 200, { ok: true });
}
