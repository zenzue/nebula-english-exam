import {redirect,error} from '@sveltejs/kit';
import {resultDetails} from '$lib/server/db.js';
export function load({locals,params}){
 if(!locals.user)redirect(303,'/login');
 const res=resultDetails(params.id,locals.user.id);
 if(!res)error(404,'Result not found');
 return {result:res};
}
