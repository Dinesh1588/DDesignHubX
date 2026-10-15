import { createClient } from '@supabase/supabase-js';

export function serverClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server configuration is missing');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function send(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(data);
}
export async function requireAdmin(req, res, db) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) { send(res, 401, { error: 'Sign in required' }); return null; }
  const { data, error } = await db.auth.getUser(auth.slice(7));
  const allow = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (error || !data?.user || !allow || data.user.email?.toLowerCase() !== allow || !data.user.email_confirmed_at) {
    send(res, 403, { error: 'Admin access denied' }); return null;
  }
  return data.user;
}
