import {fail,redirect,error} from '@sveltejs/kit';
import {getActive,startAttempt,currentQuestion,submitAnswer,finishAttempt} from '$lib/server/db.js';
export function load({locals,url}){
 if(!locals.user)redirect(303,'/login');
 const current=getActive(locals.user.id);
 if(!current)redirect(303,'/dashboard');
 const i=Number(url.searchParams.get('i')||0);
 return currentQuestion(current.id,locals.user.id,i);
}
export const actions={
 start:async({locals})=>{
  if(!locals.user)redirect(303,'/login');
  const ret=startAttempt(locals.user.id);
  if(ret.error)return fail(429,{message:ret.error});
  redirect(303,'/exam?i=0');
 },
 answer:async({locals,request})=>{
  if(!locals.user)redirect(303,'/login');
  const form=await request.formData(),id=String(form.get('id')||''),i=Number(form.get('index')),selected=Number(form.get('answer'));
  // Prevent a missing answer from coercing to the first choice.
  if(form.get('answer')===null || form.get('answer')==='')return fail(400,{message:'Choose an answer to continue.'});
  const ret=submitAnswer(id,locals.user.id,i,selected);
  if(ret.error)redirect(303,'/dashboard');
  const next=Math.min(i+1,59);
  redirect(303,`/exam?i=${next}`);
 },
 finish:async({locals,request})=>{
  if(!locals.user)redirect(303,'/login');
  const form=await request.formData(),id=String(form.get('id')||'');
  const ret=finishAttempt(id,locals.user.id);
  if(!ret)error(404,'Not found');
  redirect(303,`/results/${ret.id}`);
 }
};
