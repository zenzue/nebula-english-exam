import {redirect} from '@sveltejs/kit';
import {getActive,attemptCountToday,listResults} from '$lib/server/db.js';
import {DAILY_ATTEMPT_LIMIT,EXAM_DURATION_SECONDS,PASS_SCORE} from '$lib/server/config.js';
export function load({locals}){
 if(!locals.user)redirect(303,'/login');
 return {active:getActive(locals.user.id),used:attemptCountToday(locals.user.id),limit:DAILY_ATTEMPT_LIMIT,results:listResults(locals.user.id),examMinutes:EXAM_DURATION_SECONDS/60,passScore:PASS_SCORE};
}
