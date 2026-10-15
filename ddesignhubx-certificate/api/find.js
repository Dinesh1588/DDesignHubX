import { serverClient, send } from './_lib.js';
export default async function handler(req,res){
 if(req.method!=='GET') return send(res,405,{error:'Method not allowed'});
 const id=String(req.query.id||'').trim().toUpperCase();
 if(!/^DDHX-\d{4}-[A-F0-9]{8}$/.test(id)) return send(res,400,{error:'Enter a valid certificate ID'});
 try{const db=serverClient();const {data,error}=await db.from('certificates').select('verification_token').eq('certificate_id',id).maybeSingle();if(error)throw error;if(!data)return send(res,404,{error:'Certificate not found'});return send(res,200,{token:data.verification_token});}
 catch(e){console.error(e);return send(res,500,{error:'Search temporarily unavailable'});}
}
