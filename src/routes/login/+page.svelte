<script>
 export let form;
 let tab=form?.tab||'login';
</script>
<div class="auth-wrap">
 <div class="intro"><div class="eyebrow">SECURE STUDENT ACCESS</div><h1 class="headline">Your journey<br/><span class="grad">starts here.</span></h1><p class="subline">One identity. One focused experience. All attempts are saved securely so your progress can be measured accurately.</p><div class="labelstack"><div>◈ &nbsp; 60-minute assessment</div><div>◎ &nbsp; Three attempts per day</div><div>✧ &nbsp; Personalised skill insights</div></div></div>
 <section class="panel auth-panel">
  <div class="tab-bar"><button class:current={tab==='login'} onclick={()=>tab='login'}>Log in</button><button class:current={tab==='register'} onclick={()=>tab='register'}>Create account</button></div>
  <h2 class="section-title">{tab==='login'?'Welcome back':'Create your account'}</h2><p class="muted tiny">{tab==='login'?'Ready to continue your assessment?':'All you need is a name, email and secure password.'}</p>
  {#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
  {#if tab==='login'}
  <form method="POST" action="?/login" class="stack" style="margin-top:25px">
   <div class="field"><label for="email">EMAIL ADDRESS</label><input id="email" name="email" type="email" autocomplete="username" required placeholder="student@university.edu"/></div>
   <div class="field"><label for="password">PASSWORD</label><input id="password" name="password" type="password" autocomplete="current-password" required placeholder="Enter your password"/></div>
   <button class="btn primary block" type="submit">Enter student portal ↗</button>
  </form>
  {:else}
  <form method="POST" action="?/register" class="stack" style="margin-top:25px">
   <div class="field"><label for="name">FULL NAME</label><input id="name" name="name" minlength="2" maxlength="80" required placeholder="Your name" autocomplete="name"/></div>
   <div class="field"><label for="regemail">EMAIL ADDRESS</label><input id="regemail" name="email" type="email" required placeholder="student@university.edu" autocomplete="email"/></div>
   <div class="field"><label for="regpassword">PASSWORD (12+ CHARACTERS)</label><input id="regpassword" name="password" minlength="12" type="password" required placeholder="Create a secure password" autocomplete="new-password"/></div>
   <button class="btn primary block" type="submit">Create student account ↗</button>
  </form>
  {/if}
  <div class="auth-foot">◈ &nbsp; Your answers and exam results remain private.</div>
 </section>
</div>
<style>.auth-wrap{display:grid;grid-template-columns:1fr 445px;gap:75px;align-items:center;min-height:670px;padding:60px 0}.auth-panel{padding:35px}.auth-panel .section-title{margin:26px 0 5px}.tab-bar{display:flex;padding:5px;background:#07172d;border-radius:13px;border:1px solid #a3d8ff25;gap:3px}.tab-bar button{flex:1;border:none;border-radius:10px;background:transparent;color:#9bb1cd;padding:12px 5px;font-size:12px;font-weight:750}.tab-bar button.current{background:linear-gradient(120deg,#c1e9ff26,#aaa9ff25);color:#fff;box-shadow:inset 0 1px 0 #ffffff38}.labelstack{margin:42px 0;display:grid;gap:16px;font-size:13px;color:#a9c5df}.auth-foot{margin:25px 0 0;text-align:center;font-size:11px;color:#7f95b6}@media(max-width:900px){.auth-wrap{grid-template-columns:1fr;gap:10px;padding:20px 0}.auth-panel{max-width:520px;width:100%;margin:auto}.intro{display:none}}</style>
