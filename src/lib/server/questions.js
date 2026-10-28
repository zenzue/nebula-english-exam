import { readFileSync } from 'node:fs';
import path from 'node:path';
let cache;
export function loadBank(){
 if(!cache){
  const file=path.resolve(process.env.QUESTION_BANK_PATH||'./private/question-bank.json');
  cache=JSON.parse(readFileSync(file,'utf8'));
  if(!Array.isArray(cache)||cache.length<300)throw new Error('Expected a full private question bank');
 }
 return cache;
}
