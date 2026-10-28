import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {grade,EXAM_DURATION_SECONDS,DAILY_ATTEMPT_LIMIT,localDate} from '../src/lib/server/config.js';
const bank=JSON.parse(readFileSync(new URL('../private/question-bank.json',import.meta.url)));
test('exactly 300 items: 75 original and 225 original practice additions',()=>{
 assert.equal(bank.length,300);assert.equal(new Set(bank.map(q=>q.id)).size,300);
 assert.equal(bank.filter(q=>q.origin.startsWith('Original')).length,75);
 assert.equal(bank.filter(q=>q.origin==='New practice question').length,225);
});
test('each question has valid choices and a server-only key',()=>{
 for(const q of bank){assert.equal(q.options.length,4);assert(Number.isInteger(q.correctIndex));assert(q.correctIndex>=0&&q.correctIndex<4);assert(q.prompt.length>15);}
});
test('complete five-question reading passages',()=>{
 const passages=new Map();for(const q of bank.filter(x=>x.passage)){passages.set(q.passage.id,(passages.get(q.passage.id)||0)+1);}
 assert.equal(passages.size,30);for(const n of passages.values())assert.equal(n,5);
});
test('one hour and two retakes',()=>{assert.equal(EXAM_DURATION_SECONDS,3600);assert.equal(DAILY_ATTEMPT_LIMIT,3);});
test('grade thresholds',()=>{assert.equal(grade(69).letter,'D');assert.equal(grade(70).letter,'C');assert.equal(grade(85).letter,'A');assert.equal(grade(95).letter,'S');});
test('local calendar date is formatted',()=>assert.match(localDate(),/^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/));
