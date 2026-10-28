import {redirect} from '@sveltejs/kit';
import {revokeSession} from '$lib/server/db.js';
export function POST({cookies}){revokeSession(cookies.get('nebula_session'));cookies.delete('nebula_session',{path:'/'});redirect(303,'/');}
