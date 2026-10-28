<script>
 import '../app.css';
 export let data;
</script>
<svelte:head><title>NEBULA | English Proficiency</title><meta name="author" content="Aung Myat Thu"/><meta name="description" content="A secure, timed English proficiency assessment platform"/><meta name="viewport" content="width=device-width,initial-scale=1"/></svelte:head>
<div class="shell">
 <header class="nav">
  <a href="/" class="brand"><span class="orbit">✦</span><span>NEBULA<small>ENGLISH ASSESSMENTS</small></span></a>
  <nav class="nav-links" aria-label="Primary">
   {#if data.user}
    <a href="/dashboard">Dashboard</a><a href="/leaderboard">Leaderboard</a>
    {#if data.user.role==='admin'}<a href="/admin">Instructor</a>{/if}
    <form action="/logout" method="POST"><button class="btn sm secondary" type="submit">Log out</button></form>
   {:else}
    <a href="/#about">About</a><a href="/login" class="btn sm secondary">Student portal</a>
   {/if}
  </nav>
 </header>
 <main><slot /></main>
 <footer class="footer"><span>NEBULA © 2026 · Created by Aung Myat Thu.</span><span>One-hour timed assessment · Privacy-forward grading</span></footer>
</div>
