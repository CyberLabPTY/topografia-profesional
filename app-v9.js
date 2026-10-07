const cfg = window.SITE_CONFIG || {};
const nav = document.getElementById('siteNav');
const menu = document.querySelector('.menu-btn');
const shade = document.querySelector('.nav-shade');

function setMenu(open){
  nav?.classList.toggle('open', open);
  shade?.classList.toggle('show', open);
  menu?.setAttribute('aria-expanded', String(open));
}
menu?.addEventListener('click',()=>setMenu(!nav?.classList.contains('open')));
shade?.addEventListener('click',()=>setMenu(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

// Navegación instantánea: sin animación de desplazamiento ni scroll suave.
document.querySelectorAll('a.jump-link[href^="#"]').forEach(link=>{
  link.addEventListener('click',event=>{
    const id=link.getAttribute('href');
    const target=id && id.length>1 ? document.querySelector(id) : null;
    if(!target) return;
    event.preventDefault();
    setMenu(false);
    target.scrollIntoView({behavior:'auto',block:'start'});
    if(history.replaceState) history.replaceState(null,'',id);
    else location.hash=id;
  });
});

const form=document.getElementById('quoteForm');
const status=document.getElementById('formStatus');
form?.addEventListener('submit',async event=>{
  event.preventDefault();
  const data=Object.fromEntries(new FormData(form).entries());
  const payload={...data,source:'website',createdAt:new Date().toISOString(),page:location.href,professionalName:cfg.professionalName||''};
  if(!cfg.n8nWebhookUrl){status.textContent='Modo demostración: la automatización n8n aún no está conectada.';return;}
  status.textContent='Enviando…';
  try{
    const response=await fetch(cfg.n8nWebhookUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!response.ok) throw new Error('HTTP '+response.status);
    form.reset(); status.textContent='Solicitud recibida correctamente.';
  }catch(error){status.textContent='No fue posible enviar la solicitud. Intenta nuevamente.';console.error(error);}
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=9').catch(()=>{}));
}
