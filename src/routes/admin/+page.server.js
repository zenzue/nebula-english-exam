import {redirect,error} from '@sveltejs/kit';
import {adminStats} from '$lib/server/db.js';
import {loadBank} from '$lib/server/questions.js';
export function load({locals,url}){
 if(!locals.user)redirect(303,'/login');
 if(locals.user.role!=='admin')error(403,'Instructor access only');
 const all=loadBank();const page=Math.max(0,Math.min(29,Number(url.searchParams.get('page')||0)||0));
 return {stats:adminStats(),totalBank:all.length,page,
  questions:all.slice(page*10,(page+1)*10).map(q=>({...q,correct:'ABCD'[q.correctIndex]}))};
}
