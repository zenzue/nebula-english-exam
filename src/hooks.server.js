import { getSessionUser } from '$lib/server/db.js';
import { dev } from '$app/environment';

export async function handle({event,resolve}) {
 const raw=event.cookies.get('nebula_session');
 event.locals.user=getSessionUser(raw);
 const response=await resolve(event);
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Referrer-Policy','no-referrer');
 response.headers.set('X-Frame-Options','DENY');
 response.headers.set('Permissions-Policy','camera=(),microphone=(),geolocation=()');
 if(['/exam','/results','/admin','/dashboard','/leaderboard'].some(p=>event.url.pathname.startsWith(p))) response.headers.set('Cache-Control','no-store, private');
 if(!dev)response.headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');
 return response;
}
