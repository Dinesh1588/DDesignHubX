import { randomUUID } from 'node:crypto';
import { serverClient, send, requireAdmin } from './_lib.js';
const validText = (x, max=160) => typeof x === 'string' && x.trim().length > 0 && x.trim().length <= max;
const validDate = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x));
export default async function handler(req, res) {
  if (!['GET','POST','PATCH'].includes(req.method)) return send(res, 405, { error: 'Method not allowed' });
  try {
    const db = serverClient();
    if (!await requireAdmin(req, res, db)) return;
    if (req.method === 'GET') {
      const { data, error } = await db.from('certificates').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return send(res, 200, { certificates: data });
    }
    const body = req.body || {};
    if (req.method === 'POST') {
      if (![body.student_name, body.course, body.duration, body.mentor].every(x => validText(x)) || !validDate(body.issue_date) || (body.completion_date && !validDate(body.completion_date))) return send(res, 400, { error: 'Please enter valid certificate details' });
      // Unique certificate ID from random UUID; not sequential, avoids collisions and race conditions.
      const certificate_id = `DDHX-${new Date().getUTCFullYear()}-${randomUUID().slice(0,8).toUpperCase()}`;
      const { data, error } = await db.from('certificates').insert({ certificate_id, student_name: body.student_name.trim(), course: body.course.trim(), duration: body.duration.trim(), mentor: body.mentor.trim(), issue_date: body.issue_date, completion_date: body.completion_date || null }).select('*').single();
      if (error) throw error;
      return send(res, 201, { certificate: data });
    }
    if (!/^[0-9a-f-]{36}$/i.test(String(body.id || '')) || !['active','revoked'].includes(body.status)) return send(res, 400, { error: 'Invalid request' });
    const { data, error } = await db.from('certificates').update({ status: body.status }).eq('id', body.id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return send(res, 404, { error: 'Certificate not found' });
    return send(res, 200, { certificate: data });
  } catch (e) { console.error(e); return send(res, 500, { error: 'Request failed. Please try again.' }); }
}
