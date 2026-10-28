<script>export let data;export let form;
 import {page} from '$app/stores';
 const fmt = (ms)=>new Date(ms).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
</script>
<div class="page-head"><div class="eyebrow">YOUR ASSESSMENT CONTROL CENTRE</div><h1>Welcome back, <span class="gradient-text">{$page.data.user.name.split(' ')[0]}.</span></h1><p class="subline">Progress isn’t a destination. It’s a series of discoveries.</p></div>
<div class="grid3 stats"><div class="panel stat"><div class="stat-label">ATTEMPTS REMAINING TODAY</div><div class="big-num">{Math.max(0,data.limit-data.used)} <span>/ {data.limit}</span></div><p>Includes your first attempt and two retakes</p></div><div class="panel stat"><div class="stat-label">ASSESSMENT DURATION</div><div class="big-num">60<span> MIN</span></div><p>Server-enforced timer</p></div><div class="panel stat"><div class="stat-label">PASS THRESHOLD</div><div class="big-num">{data.passScore}<span>%</span></div><p>With grades S, A, B, C, D and F</p></div></div>
<div class="grid2 course-layout" style="margin-top:22px">
 <section class="panel launch"><div class="eyebrow">ASSESSMENT 01 / ENGLISH PROFICIENCY</div><h2>English Proficiency<br/><span class="gradient-text">Master Challenge</span></h2><p class="muted" style="line-height:1.7;font-size:14px">A unique set of 60 questions selected from a protected 300-question bank, including reading comprehension and grammar.</p><div class="metrics"><span>◎ &nbsp; 60 QUESTIONS</span><span>◷ &nbsp; 60 MINUTES</span><span>✦ &nbsp; INSTANT GRADING</span></div>
  {#if form?.message}<p class="error">{form.message}</p>{/if}
  {#if data.active}<a class="btn primary" href="/exam">Resume assessment ↗</a>
  {:else if data.used < data.limit}<form action="/exam?/start" method="POST"><button class="btn primary" type="submit">Launch assessment ↗</button></form>
  {:else}<button class="btn secondary" disabled>Daily attempts exhausted</button>{/if}
  <p class="notice" style="margin-top:15px">Your session continues if you refresh. The timer cannot be paused and unfinished attempts expire after 60 minutes.</p>
 </section>
 <section class="panel history"><div class="flex between"><h2 class="section-title">Recent sessions</h2><span class="tag">HISTORY</span></div>
  {#if data.results.length===0}<div class="empty" style="margin-top:35px"><div style="font-size:35px;margin-bottom:12px;color:#9dd7ff">◌</div><p>No completed exams yet.</p><p class="tiny muted">Your journey begins with your first session.</p></div>
  {:else}<div class="session-list">{#each data.results.slice(0,5) as r}<a class="session-row" href={'/results/'+r.id}><div><b>{r.percent}%</b><small>{fmt(r.completed_at)}</small></div><span class:passed={r.percent>=70} class="status">{r.percent>=70?'PASS':'REVIEW'}</span><span>↗</span></a>{/each}</div>{/if}
 </section>
</div>
<style>.stats .stat{min-height:155px}.stat .big-num{margin-top:25px}.stat .big-num span{font:500 17px 'SF Pro Display';letter-spacing:0;color:#8196b7}.stat p{font-size:12px;color:#8c9eb9}.launch{min-height:390px;padding:37px}.launch h2{font:700 33px 'SF Pro Display';letter-spacing:-.055em;line-height:1.15;margin:22px 0}.metrics{display:flex;gap:15px;flex-wrap:wrap;margin:23px 0;font-size:11px;letter-spacing:.08em;color:#8bd4e2}.history{padding:34px}.history .section-title{margin:0}.session-list{margin-top:25px}.session-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:15px 0;border-bottom:1px solid #d8e9ff18}.session-row div{display:grid;gap:5px}.session-row small{color:#8198b7;font-size:11px}.status{font-size:10px;letter-spacing:.08em;font-weight:750;color:#ffd6b4}.status.passed{color:#8df5d4}@media(max-width:680px){.launch{padding:24px}.metrics{gap:8px}}</style>
