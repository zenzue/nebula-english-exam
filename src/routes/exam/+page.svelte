<script>
 import {onMount} from 'svelte';
 export let data;export let form;
 let remaining=3600;
 let warning=false;
 let chosen=data.selected===null ? null : data.selected;
 $: chosen = data.selected===null ? null : data.selected;
 $: pct=Math.round((data.index+1)/data.attempt.total*100);
 $: mins=String(Math.floor(remaining/60)).padStart(2,'0');
 $: secs=String(remaining%60).padStart(2,'0');
 onMount(()=>{
  function tick(){remaining=Math.max(0,Math.ceil((data.attempt.deadlineAt-Date.now())/1000));if(remaining===0)location.reload();}
  tick();const t=setInterval(tick,900);return()=>clearInterval(t);
 });
 function blockCopy(e){e.preventDefault();}
</script>
<svelte:head><title>Live Assessment | NEBULA</title></svelte:head>
<div class="exam-layout" oncontextmenu={blockCopy} oncopy={blockCopy} oncut={blockCopy}>
 <div class="exam-top"><div><div class="eyebrow">LIVE ASSESSMENT / ENGLISH PROFICIENCY</div><h1>Focus mode <span class="tiny muted">01 · MASTER CHALLENGE</span></h1></div><div class:urgent={remaining<300} class="timer"><div class="timer-label">TIME REMAINING</div><div class="timer-digits">{mins}<span>:</span>{secs}</div></div></div>
 <div class="progress-wrap"><div class="flex between"><span class="stat-label">QUESTION {data.index+1} / {data.attempt.total}</span><span class="stat-label">{data.attempt.answered} ANSWERED · {pct}% THROUGH</span></div><div class="progress-track"><div class="progress-fill" style:width={pct+'%'}></div></div></div>
 <div class="grid2 body-grid">
  <section class="panel question-card">
   <div class="flex between"><span class="tag"><span class="dot"></span> {data.question.category.toUpperCase()}</span><span class="numb">{String(data.index+1).padStart(2,'0')} / {String(data.attempt.total).padStart(2,'0')}</span></div>
   {#if data.question.passage}<div class="passage"><div class="eyebrow">READING PASSAGE</div><h2>{data.question.passage.title}</h2><p>{data.question.passage.text}</p></div>{/if}
   <h2 class="prompt">{data.question.prompt}</h2>
   {#if form?.message}<div class="error">{form.message}</div>{/if}
   <form method="POST" action="?/answer" class="options">
    <input type="hidden" name="id" value={data.attempt.id}/><input type="hidden" name="index" value={data.index}/>
    {#each data.question.options as opt,i}<label class:checked={chosen===i} class="option"><input type="radio" name="answer" value={i} bind:group={chosen}/><span class="option-letter">{'ABCD'[i]}</span><span>{opt}</span><span class="indicator"></span></label>{/each}
    <div class="flex between controls"><a class="btn secondary" href={'/exam?i='+Math.max(0,data.index-1)} aria-disabled={data.index===0}>← Previous</a><button type="submit" class="btn primary">{data.index===data.attempt.total-1?'Save answer':'Save & next'} →</button></div>
   </form>
  </section>
  <aside class="side-stack"><section class="panel side"><div class="eyebrow">SESSION TELEMETRY</div><h3>Your progress</h3><div class="flex between"><span class="muted tiny">Completed responses</span><b>{data.attempt.answered} / {data.attempt.total}</b></div><div class="progress-track"><div class="progress-fill" style:width={(data.attempt.answered/data.attempt.total*100)+'%'}></div></div><div class="scale"></div><div class="hint"><span>◈</span><p>Only one question at a time is sent to your browser. Answers and the full bank stay on the server.</p></div></section>
  <section class="panel side"><div class="eyebrow">NAVIGATION</div><h3>Review & submit</h3><p class="notice">You can revisit earlier questions until you finish. Unanswered questions receive zero points.</p>
   <button type="button" class="btn secondary block" onclick={()=>warning=!warning}>Submit entire exam ↗</button>
   {#if warning}<div class="confirm"><p class="tiny">Submit now? Your result will be final, including unanswered questions.</p><form method="POST" action="?/finish"><input type="hidden" name="id" value={data.attempt.id}/><button class="btn danger block" type="submit">Confirm final submission</button></form></div>{/if}
  </section></aside>
 </div>
 <p class="policy">SECURE ASSESSMENT · Browser copy and right-click are discouraged but cannot prevent screen capture. Do not use external resources unless your instructor permits them.</p>
</div>
<style>.exam-layout{padding:34px 0 0;user-select:none;-webkit-user-select:none}.exam-top{display:flex;align-items:flex-end;justify-content:space-between;gap:15px}.exam-top h1{font:700 38px 'SF Pro Display';margin:14px 0 0;letter-spacing:-.05em}.exam-top h1 .tiny{font:600 12px 'SF Pro Text';letter-spacing:.03em}.timer{text-align:right;border:1px solid #a7e4ff47;border-radius:18px;background:linear-gradient(115deg,#75cfff1b,#b2a3ff17);min-width:170px;padding:12px 24px;box-shadow:inset 0 1px 0 #fff2}.timer.urgent{border-color:#ffacac87;color:#ffc6ae}.timer-label{font-size:10px;letter-spacing:.15em;color:#94b7d4}.timer-digits{font:700 32px 'SF Pro Display';font-variant-numeric:tabular-nums;letter-spacing:.02em}.timer-digits span{color:#a9c4e1;opacity:.65}.progress-wrap{margin:27px 0}.progress-wrap .progress-track{margin-top:12px}.body-grid{grid-template-columns:1.65fr .85fr;align-items:start}.question-card{min-height:500px;padding:35px}.numb{font:700 12px 'SF Pro Display';color:#8f9bbf}.prompt{font:600 clamp(23px,2.7vw,32px)/1.4 'SF Pro Display';letter-spacing:-.04em;margin:33px 0 29px;max-width:680px}.passage{border-left:2px solid #7cdded;padding:7px 0 8px 18px;background:linear-gradient(90deg,#78caff09,transparent);margin-top:29px}.passage h2{font:650 21px 'SF Pro Display';margin:9px 0}.passage p{font:400 13px/1.8 'SF Pro Text';color:#b6c7de;margin:0;max-height:220px;overflow-y:auto;user-select:none}.options{display:flex;flex-direction:column;gap:10px}.option{display:flex;align-items:center;gap:14px;border:1px solid #b1cdff25;border-radius:15px;background:#bed5ff09;padding:14px 17px;min-height:66px;cursor:pointer;font-size:14px;color:#cad8ee;transition:all .2s}.option:hover{border-color:#8dc9ff80;background:#8dc9ff10}.option.checked{border-color:#95dcff9e;background:linear-gradient(100deg,#86c8ff28,#8973df14);color:#fff;box-shadow:inset 0 1px 0 #ffffff24}.option input{position:absolute;opacity:0;pointer-events:none}.option:focus-within{outline:2px solid #8bdafa;outline-offset:2px}.option-letter{width:35px;height:35px;flex-shrink:0;display:grid;place-items:center;border:1px solid #b2d9ff38;border-radius:11px;color:#96bce6;font:750 13px 'SF Pro Display'}.option.checked .option-letter{background:#8edcff;color:#062440;border:0}.indicator{margin-left:auto;width:14px;height:14px;border:1px solid #91a7c4;border-radius:50%;flex-shrink:0}.option.checked .indicator{border:4px solid #9ceadf;background:#13364a}.controls{margin-top:21px}.side-stack{display:grid;gap:18px}.side{padding:25px}.side h3{font:650 20px 'SF Pro Display';margin:18px 0 23px}.side .progress-track{margin-top:12px}.hint{display:flex;align-items:flex-start;gap:12px;color:#aac2d9;font-size:12px;line-height:1.6}.hint span{color:#87eed9;font-size:25px}.hint p{margin:0}.confirm{margin-top:15px;padding:15px;border-radius:13px;background:#ffb3b315}.policy{color:#66809c;font-size:10px;letter-spacing:.06em;line-height:1.7;margin-top:35px}@media(max-width:800px){.body-grid{grid-template-columns:1fr}.exam-top h1{font-size:29px}.question-card{padding:23px}.timer{min-width:132px;padding:12px}.timer-digits{font-size:25px}.side-stack{grid-template-columns:1fr 1fr}}@media(max-width:560px){.side-stack{grid-template-columns:1fr}.exam-top{align-items:center}.exam-top h1 .tiny{display:none}.controls .btn{padding:12px}}
</style>
