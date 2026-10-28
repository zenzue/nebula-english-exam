import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes, createHash, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import { EXAM_DURATION_SECONDS, DAILY_ATTEMPT_LIMIT, EXAM_QUESTION_COUNT, localDate, grade, PASS_SCORE } from './config.js';
import { loadBank } from './questions.js';

const file = path.resolve(process.env.DATABASE_PATH || './data/exam.sqlite');
mkdirSync(path.dirname(file), { recursive: true });
export const db = new DatabaseSync(file);
db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 pass_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS login_checks (
 ip TEXT PRIMARY KEY, failures INTEGER NOT NULL, first_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS attempts (
 id TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 attempt_date TEXT NOT NULL,
 started_at INTEGER NOT NULL,
 deadline_at INTEGER NOT NULL,
 completed_at INTEGER,
 score INTEGER,
 total INTEGER NOT NULL,
 percent INTEGER,
 status TEXT NOT NULL CHECK(status IN ('active','completed'))
);
CREATE INDEX IF NOT EXISTS idx_attempts_user_date ON attempts(user_id,attempt_date);
CREATE TABLE IF NOT EXISTS attempt_items (
 attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
 ordinal INTEGER NOT NULL,
 question_id TEXT NOT NULL,
 selected INTEGER CHECK(selected BETWEEN 0 AND 3),
 PRIMARY KEY (attempt_id,ordinal)
);
`);

export function hashPassword(password,salt=randomBytes(16).toString('hex')) {
 return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;
}
export function validPassword(password, hash) {
 if (typeof password!=='string' || !hash) return false;
 const [salt,digest]=hash.split(':');
 if (!salt || !digest || digest.length!==128) return false;
 const a=scryptSync(password,salt,64), b=Buffer.from(digest,'hex');
 return timingSafeEqual(a,b);
}
export function createUser(email,name,password,role='student') {
 const info=db.prepare('INSERT INTO users(email,name,pass_hash,role,created_at) VALUES (?,?,?,?,?)').run(email.trim().toLowerCase(),name.trim(),hashPassword(password),role,Date.now());
 return db.prepare('SELECT id,email,name,role FROM users WHERE id=?').get(Number(info.lastInsertRowid));
}
export function findUser(email) { return db.prepare('SELECT * FROM users WHERE email=?').get(email.trim().toLowerCase()); }
const sha=(s)=>createHash('sha256').update(s).digest('hex');
export function makeSession(userId) {
 const token=randomBytes(32).toString('base64url');
 db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(sha(token),userId,Date.now()+7*24*3600_000);
 return token;
}
export function getSessionUser(token) {
 if (!token) return null;
 const row=db.prepare('SELECT u.id,u.email,u.name,u.role FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?').get(sha(token),Date.now());
 return row||null;
}
export function revokeSession(token) { if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha(token)); }
export function allowLogin(ip) {
 const rec=db.prepare('SELECT * FROM login_checks WHERE ip=?').get(ip);
 return !rec || Date.now()-rec.first_at>15*60_000 || rec.failures<8;
}
export function recordLogin(ip,ok) {
 if(ok){db.prepare('DELETE FROM login_checks WHERE ip=?').run(ip);return;}
 const rec=db.prepare('SELECT * FROM login_checks WHERE ip=?').get(ip);
 if(!rec || Date.now()-rec.first_at>15*60_000) db.prepare('INSERT OR REPLACE INTO login_checks VALUES (?,?,?)').run(ip,1,Date.now());
 else db.prepare('UPDATE login_checks SET failures=failures+1 WHERE ip=?').run(ip);
}
function shuffle(arr) {
 const result=[...arr];
 for(let i=result.length-1;i>0;i--){const j=randomInt(i+1);[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
export function attemptCountToday(userId) {
 return Number(db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE user_id=? AND attempt_date=?').get(userId,localDate()).n);
}
export function getActive(userId) {
 const attempt=db.prepare("SELECT * FROM attempts WHERE user_id=? AND status='active' ORDER BY started_at DESC LIMIT 1").get(userId);
 if(attempt && attempt.deadline_at<=Date.now()) {finishAttempt(attempt.id);return null;}
 return attempt||null;
}
export function startAttempt(userId) {
 // Transaction protects limit against concurrent submissions in this process and across SQLite clients.
 db.exec('BEGIN IMMEDIATE');
 try {
  const current=db.prepare("SELECT * FROM attempts WHERE user_id=? AND status='active' ORDER BY started_at DESC LIMIT 1").get(userId);
  if(current && current.deadline_at>Date.now()) {db.exec('COMMIT');return {id:current.id,continued:true};}
  if(current) finishAttemptCore(current.id);
  const n=db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE user_id=? AND attempt_date=?').get(userId,localDate()).n;
  if(n>=DAILY_ATTEMPT_LIMIT) {db.exec('COMMIT');return {error:'Daily limit reached. You may take one exam and two retakes per day.'};}
  const bank=loadBank();
  const grammar=shuffle(bank.filter(q=>q.category==='Grammar & Vocabulary')).slice(0,40);
  const readingGroups=new Map();
  for (const q of bank.filter(q=>q.category==='Reading Comprehension')) {
   if(!readingGroups.has(q.passage.id))readingGroups.set(q.passage.id,[]);
   readingGroups.get(q.passage.id).push(q);
  }
  const groups=shuffle([...readingGroups.values()].filter(g=>g.length===5)).slice(0,4);
  const questions=[...grammar,...groups.flat()];
  if(questions.length!==EXAM_QUESTION_COUNT)throw new Error('Question bank is incomplete');
  const id=randomBytes(12).toString('hex'), now=Date.now();
  db.prepare('INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,userId,localDate(now),now,now+EXAM_DURATION_SECONDS*1000,null,null,questions.length,null,'active');
  const insert=db.prepare('INSERT INTO attempt_items(attempt_id,ordinal,question_id,selected) VALUES(?,?,?,NULL)');
  for(let i=0;i<questions.length;i++)insert.run(id,i,questions[i].id);
  db.exec('COMMIT');return {id,continued:false};
 }catch(e){db.exec('ROLLBACK');throw e;}
}
export function getAttempt(id,userId) {
 const row=db.prepare('SELECT * FROM attempts WHERE id=? AND user_id=?').get(id,userId);
 if(!row)return null;
 if(row.status==='active' && Date.now()>=row.deadline_at){finishAttempt(row.id);return db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id);}
 return row;
}
export function currentQuestion(id,userId,index) {
 const attempt=getAttempt(id,userId);
 if(!attempt || attempt.status!=='active')return {attempt};
 const n=Math.max(0,Math.min(attempt.total-1,Math.floor(Number(index)||0)));
 const item=db.prepare('SELECT * FROM attempt_items WHERE attempt_id=? AND ordinal=?').get(id,n);
 if(!item)return {attempt};
 const q=loadBank().find(x=>x.id===item.question_id);
 if(!q)return {attempt};
 // Only return student-safe fields, never the correctIndex or answer commentary.
 const {prompt,options,category,passage,skill}=q;
 const answered=db.prepare('SELECT count(*) n FROM attempt_items WHERE attempt_id=? AND selected IS NOT NULL').get(id).n;
 return {attempt:{id:attempt.id,deadlineAt:attempt.deadline_at,total:attempt.total,answered,startedAt:attempt.started_at},index:n,question:{prompt,options,category,passage,skill},selected:item.selected};
}
export function submitAnswer(id,userId,index,selected) {
 const attempt=getAttempt(id,userId);
 if(!attempt || attempt.status!=='active')return {error:'Exam is unavailable or has expired'};
 if(!Number.isInteger(index) || index<0 || index>=attempt.total || !Number.isInteger(selected) || selected<0 || selected>3)return {error:'Invalid answer'};
 db.prepare('UPDATE attempt_items SET selected=? WHERE attempt_id=? AND ordinal=?').run(selected,id,index);
 return {ok:true};
}
function finishAttemptCore(id) {
 const att=db.prepare('SELECT * FROM attempts WHERE id=?').get(id);
 if(!att || att.status!=='active')return;
 const bank=new Map(loadBank().map(q=>[q.id,q]));
 const rows=db.prepare('SELECT question_id,selected FROM attempt_items WHERE attempt_id=?').all(id);
 let correct=0;
 for(const x of rows){const q=bank.get(x.question_id);if(q && x.selected===q.correctIndex)correct++;}
 const pct=Math.round((correct/att.total)*100);
 db.prepare("UPDATE attempts SET score=?,percent=?,completed_at=?,status='completed' WHERE id=?").run(correct,pct,Date.now(),id);
}
export function finishAttempt(id,userId=null) {
 if(userId){const row=db.prepare('SELECT user_id FROM attempts WHERE id=?').get(id);if(!row || row.user_id!==userId) return null;}
 finishAttemptCore(id);
 return db.prepare('SELECT * FROM attempts WHERE id=?').get(id);
}
export function listResults(userId) {
 return db.prepare("SELECT id,started_at,completed_at,score,total,percent FROM attempts WHERE user_id=? AND status='completed' ORDER BY completed_at DESC LIMIT 30").all(userId);
}
export function resultDetails(id,userId){
 const att=getAttempt(id,userId);
 if(!att || att.status!=='completed')return null;
 const map=new Map(loadBank().map(q=>[q.id,q]));
 const rows=db.prepare('SELECT question_id,selected FROM attempt_items WHERE attempt_id=?').all(id);
 const stat={};
 for(const x of rows){const q=map.get(x.question_id);if(!q)continue;
  if(!stat[q.category])stat[q.category]={count:0,correct:0};
  stat[q.category].count++; if(x.selected===q.correctIndex)stat[q.category].correct++;
 }
 return {id:att.id,score:att.score,total:att.total,percent:att.percent,passed:att.percent>=PASS_SCORE,grade:grade(att.percent),completedAt:att.completed_at,durationSeconds:Math.min(EXAM_DURATION_SECONDS,Math.round((att.completed_at-att.started_at)/1000)),byCategory:Object.entries(stat).map(([category,s])=>({category,...s,percent:Math.round(s.correct/s.count*100)})),rank:rankFor(userId)};
}
export function leaderboard(){
 // Best completed attempt only per student; admin attempts excluded.
 return db.prepare(`SELECT u.id user_id,u.name,MAX(a.percent) percent,MIN(a.completed_at) completed_at
  FROM users u JOIN attempts a ON a.user_id=u.id
  WHERE u.role='student' AND a.status='completed'
  GROUP BY u.id,u.name ORDER BY percent DESC,completed_at ASC LIMIT 100`).all().map((u,i)=>({...u,rank:i+1}));
}
export function rankFor(userId){return leaderboard().find(x=>x.user_id===userId)?.rank??null;}
export function adminStats(){
 return {students:db.prepare("SELECT count(*) n FROM users WHERE role='student'").get().n,
  completed:db.prepare("SELECT count(*) n FROM attempts WHERE status='completed'").get().n,
  passRate:db.prepare("SELECT COALESCE(ROUND(AVG(CASE WHEN percent>=70 THEN 100.0 ELSE 0 END)),0) x FROM attempts WHERE status='completed'").get().x,
  recent:db.prepare("SELECT u.name,u.email,a.percent,a.score,a.total,a.completed_at FROM attempts a JOIN users u ON a.user_id=u.id WHERE a.status='completed' ORDER BY a.completed_at DESC LIMIT 20").all()};
}
