/* Runtime init: startup wiring and page interaction bootstrap */

window.addEventListener('DOMContentLoaded', function(){
  var saved = localStorage.getItem('ig-dash-theme');
  if(saved === 'dark'){
    document.documentElement.setAttribute('data-theme', 'dark');
    updateDarkBtn('dark');
  }
  if (DEBUG_MODE) {
    var debugBtn = document.getElementById('debugToggleBtn');
    if (debugBtn) debugBtn.style.display = 'inline-flex';
  }
  initDashboard();
});

function initRevealAnimations(){
  document.body.classList.add('reveal-ready');

  if(typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    return;
  }

  var aboveFold = [
    {sel:'.hdr.reveal', delay:300},
    {sel:'.nav-bar.reveal', delay:550},
    {sel:'#sec-overview .sec-group-header.reveal', delay:800},
    {sel:'.cards-s.reveal', delay:1000},
    {sel:'.gv-sec.reveal', delay:1200}
  ];
  var aboveFoldEls = new Set();

  aboveFold.forEach(function(item){
    var el = document.querySelector(item.sel);
    if(el){
      aboveFoldEls.add(el);
      setTimeout(function(){ el.classList.add('visible'); }, item.delay);
    }
  });

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});

  document.querySelectorAll('.reveal').forEach(function(el){
    if(!aboveFoldEls.has(el) && !el.classList.contains('visible')){
      observer.observe(el);
    }
  });
}

(function initNav(){
  const nav = document.getElementById('navBar');
  if(!nav) return;
  const items = nav.querySelectorAll('.nav-item');
  const sectionIds = ['sec-overview','sec-engagement','sec-content','sec-history'];
  let lastScroll = 0;
  let ticking = false;

  items.forEach(item => {
    item.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.getElementById(this.dataset.sec);
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'start'});
        items.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  function updateNav(){
    const scrollY = window.scrollY;
    const navH = nav.offsetHeight + 20;

    if(scrollY > 200){
      nav.classList.add('scrolled');
      if(scrollY > lastScroll && scrollY > 400){
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
    } else {
      nav.classList.remove('scrolled');
      nav.classList.remove('hidden');
    }
    lastScroll = scrollY;

    let activeId = sectionIds[0];
    for(let i = sectionIds.length - 1; i >= 0; i--){
      const sec = document.getElementById(sectionIds[i]);
      if(sec && sec.getBoundingClientRect().top <= navH + 60){
        activeId = sectionIds[i];
        break;
      }
    }
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.sec === activeId);
    });
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, {passive:true});
})();

window.initRevealAnimations = initRevealAnimations;
