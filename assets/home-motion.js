(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 741px) and (pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  const qa = window.__ZEROHAND_QA__ = {motion:false, smoothing:false, fontRefreshes:0, loadRefreshes:0};
  let paused=false, lenis=null, context=null, ready=false, loading=false;
  const eligible=()=>desktop.matches&&!reduce.matches&&!paused;
  const refresh=kind=>{if(ready){ScrollTrigger.refresh();if(lenis)lenis.resize();if(kind)qa[kind+'Refreshes']++;}};
  function stop(){if(context){context.revert();context=null;}if(lenis){lenis.destroy();lenis=null;}qa.motion=false;qa.smoothing=false;}
  function start(){
    if(!ready||!eligible()||qa.motion)return;
    lenis=new Lenis({duration:1.05,autoRaf:false});lenis.on('scroll',ScrollTrigger.update);
    qa.motion=true;qa.smoothing=true;
    context=gsap.context(()=>{
      gsap.fromTo('.report-stage .mini',{rotationY:-9,rotationX:4,rotationZ:-3},{rotationY:0,rotationX:0,rotationZ:0,ease:'none',scrollTrigger:{trigger:'.report-stage',start:'top 90%',end:'center 45%',scrub:true}});
      gsap.to('.film-art',{y:-18,ease:'none',scrollTrigger:{trigger:'.lab-intro',start:'top top',end:'bottom top',scrub:true}});
    });
    toggle.hidden=false;refresh();
  }
  const load=url=>new Promise(resolve=>{const s=document.createElement('script');s.src=url;s.onload=()=>resolve(true);s.onerror=()=>{s.remove();resolve(false);};document.head.append(s);});
  async function enhance(){
    if(!eligible()||loading)return;if(ready){start();return;}loading=true;
    try{
      for(const name of ['gsap@3.15.0/dist/gsap.min.js','gsap@3.15.0/dist/ScrollTrigger.min.js','lenis@1.3.27/dist/lenis.min.js']){if(!await load('https://cdn.jsdelivr.net/npm/'+name))return;}
      if(!window.gsap||!window.ScrollTrigger||!window.Lenis)return;
      ready=true;gsap.registerPlugin(ScrollTrigger);gsap.ticker.lagSmoothing(0);
      gsap.ticker.add(time=>{if(lenis)lenis.raf(time*1000);},false,true);start();
      document.fonts.ready.then(()=>refresh('font'));if(document.readyState==='complete')refresh('load');
    }finally{loading=false;}
  }
  function preference(){if(!eligible())stop();else enhance();}
  reduce.addEventListener('change',preference);desktop.addEventListener('change',preference);
  toggle.addEventListener('click',()=>{paused=!paused;preference();toggle.textContent=paused?'Resume motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));});
  window.addEventListener('load',()=>refresh('load'));
  document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>refresh()));
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',event=>{
    const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;
    event.preventDefault();const y=Math.max(0,target.getBoundingClientRect().top+scrollY-28);
    if(lenis){lenis.resize();lenis.scrollTo(y,{immediate:true});}else window.scrollTo({top:y,behavior:'instant'});
    if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});history.replaceState(null,'',a.getAttribute('href'));
  }));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{'requestIdleCallback'in window?requestIdleCallback(enhance,{timeout:1200}):setTimeout(enhance,0);}));
})();
