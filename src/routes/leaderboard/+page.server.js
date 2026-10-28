import {redirect} from '@sveltejs/kit';
import {leaderboard} from '$lib/server/db.js';
export function load({locals}){
 if(!locals.user)redirect(303,'/login');
 return {leaders:leaderboard().map(x=>({rank:x.rank,name:x.name,percent:x.percent})),self:locals.user.id};
}
