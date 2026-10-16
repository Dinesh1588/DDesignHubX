import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';

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
function sessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('Admin session secret is not configured');
  return value;
}
function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  return left.length === right.length && timingSafeEqual(left, right);
}
function signature(value) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}
function cookieValue(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const part = cookieHeader.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  if (!part) return '';
  try { return decodeURIComponent(part.slice(name.length + 1)); } catch { return ''; }
}
export function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return payload + '.' + signature(payload);
}
export function setAdminCookie(res, token) {
  res.setHeader('Set-Cookie', 'ddhx_admin_session=' + encodeURIComponent(token) + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800');
}
export function clearAdminCookie(res) {
  res.setHeader('Set-Cookie', 'ddhx_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
}
export function validAdminSession(req) {
  try {
    const token = cookieValue(req, 'ddhx_admin_session');
    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
    if (!safeEqual(signature(parts[0]), parts[1])) return false;
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch { return false; }
}
export async function requireAdmin(req, res) {
  if (!validAdminSession(req)) {
    send(res, 401, { error: 'Admin sign in required' });
    return null;
  }
  return { username: process.env.ADMIN_USERNAME };
}
