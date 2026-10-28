import { fail,redirect } from '@sveltejs/kit';
import {findUser,createUser,validPassword,makeSession,allowLogin,recordLogin} from '$lib/server/db.js';

function setCookie(cookies,token){cookies.set('nebula_session',token,{path:'/',httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:7*24*3600});}
function ipFor(event){try{return event.getClientAddress();}catch{return 'unknown';}}
export const actions={
 login:async(event)=>{
  const ip=ipFor(event);if(!allowLogin(ip))return fail(429,{message:'Too many attempts. Try again in 15 minutes.',tab:'login'});
  const data=await event.request.formData();const email=String(data.get('email')||'').toLowerCase().trim(),pw=String(data.get('password')||'');
  const found=findUser(email);
  if(!found || !validPassword(pw,found.pass_hash)){recordLogin(ip,false);return fail(400,{message:'Incorrect email or password.',tab:'login'});}
  recordLogin(ip,true);setCookie(event.cookies,makeSession(found.id));redirect(303,'/dashboard');
 },
 register:async(event)=>{
  const ip=ipFor(event);if(!allowLogin(ip))return fail(429,{message:'Please try again later.',tab:'register'});
  const d=await event.request.formData(),email=String(d.get('email')||'').toLowerCase().trim(),name=String(d.get('name')||'').trim(),pw=String(d.get('password')||'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||name.length<2||name.length>80||pw.length<12||pw.length>200)return fail(400,{message:'Enter a valid email, your name, and a password of at least 12 characters.',tab:'register'});
  if(findUser(email))return fail(400,{message:'This email is already registered.',tab:'register'});
  const user=createUser(email,name,pw);setCookie(event.cookies,makeSession(user.id));redirect(303,'/dashboard');
 }
};
