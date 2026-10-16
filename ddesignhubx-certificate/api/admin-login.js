import { timingSafeEqual } from 'node:crypto';
import { createAdminSession, send, setAdminCookie } from './_lib.js';

function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  return left.length === right.length && timingSafeEqual(left, right);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) {
    return send(res, 500, { error: 'Admin login is not configured on the server' });
  }
  const body = req.body || {};
  if (!safeEqual(body.username, username) || !safeEqual(body.password, password)) {
    return send(res, 401, { error: 'Incorrect username or password' });
  }
  setAdminCookie(res, createAdminSession());
  return send(res, 200, { ok: true });
}
