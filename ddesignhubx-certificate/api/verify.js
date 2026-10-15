import { serverClient, send } from './_lib.js';
export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const token = String(req.query.token || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return send(res, 400, { error: 'Invalid verification token' });
  try {
    const db = serverClient();
    const { data, error } = await db.from('certificates').select('certificate_id,student_name,course,duration,mentor,issue_date,completion_date,status').eq('verification_token', token).maybeSingle();
    if (error) throw error;
    if (!data) return send(res, 404, { error: 'Certificate not found' });
    return send(res, 200, { certificate: data });
  } catch (e) { console.error(e); return send(res, 500, { error: 'Verification temporarily unavailable' }); }
}
