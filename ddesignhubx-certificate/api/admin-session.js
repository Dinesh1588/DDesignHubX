import { send, validAdminSession } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  if (!validAdminSession(req)) return send(res, 401, { error: 'Admin sign in required' });
  return send(res, 200, { ok: true });
}
