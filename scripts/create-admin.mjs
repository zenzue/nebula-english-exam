import { createUser,findUser } from '../src/lib/server/db.js';
const email=process.env.ADMIN_EMAIL, password=process.env.ADMIN_PASSWORD;
if(!email||!password||password.length<16){console.error('ADMIN_EMAIL and ADMIN_PASSWORD (16+ chars) are required.');process.exit(1);}
if(findUser(email)){console.error('Account already exists; not changing roles.');process.exit(1);}
createUser(email,'Course Instructor',password,'admin');
console.log('Instructor account created:',email);
