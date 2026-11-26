import Lenis from "lenis";


(function(){
  var FB=16,BW=1920,CO=.6666;
  function ap(){var w=innerWidth,r=((BW-w)/BW)*100*CO,s=FB-(FB*r)/100;
    if(s>FB)document.documentElement.style.fontSize=s+"px";else document.documentElement.style.removeProperty("font-size")}
  ap();addEventListener("resize",ap);
})();

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const lenis = new Lenis({smoothWheel:true});
window.lenis = lenis;
(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0);
history.scrollRestoration="manual";scrollTo(0,0);
if(!reduce) lenis.stop();


document.addEventListener("click",e=>{
  const a=e.target.closest('a[href^="#"]'); if(!a) return;
  const id=a.getAttribute("href"); const el=id==="#top"?document.body:$(id); if(!el) return;
  e.preventDefault(); lenis.scrollTo(id==="#top"?0:el);
  closeMenu();
});


const burger=$("#burger"), menu=$("#menu");
function closeMenu(){burger.classList.remove("open");menu.classList.remove("open");burger.setAttribute("aria-expanded","false");menu.setAttribute("aria-hidden","true");}
burger.addEventListener("click",()=>{const o=!menu.classList.contains("open");burger.classList.toggle("open",o);menu.classList.toggle("open",o);burger.setAttribute("aria-expanded",o);menu.setAttribute("aria-hidden",!o);});


function Spring(k,c,x0,onUpd){
  let x=x0,v=0,t=x0,run=false,last=0;
  function step(now){
    let dt=Math.min((now-last)/1000,.032);last=now;
    const n=4,h=dt/n;
    for(let i=0;i<n;i++){const a=-k*(x-t)-c*v;v+=a*h;x+=v*h;}
    onUpd(x);
    if(Math.abs(v)<.002&&Math.abs(x-t)<.0005){x=t;onUpd(x);run=false;return;}
    requestAnimationFrame(step);
  }
  return {to(n){t=n;if(!run){run=true;last=performance.now();requestAnimationFrame(step);}},get v(){return x}};
}

/* ---- Liquid image ---- */
let uid=0;
const hoverOK=()=>matchMedia("(hover:hover)").matches && innerWidth>768;
function liquid(box,maxScale){
  const full=!box.classList.contains("bare");
  const media=$("img,video",box); const id="lq"+(uid++);
  const ns="http://www.w3.org/2000/svg";
  const svg=document.createElementNS(ns,"svg");
  svg.setAttribute("width","0");svg.setAttribute("height","0");svg.style.cssText="position:absolute;width:0;height:0";
  svg.setAttribute("aria-hidden","true");
  svg.innerHTML=`<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="2" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="1"/></filter>`;
  box.prepend(svg);
  const turb=$("feTurbulence",svg), disp=$("feDisplacementMap",svg);
  let veil,glow;
  if(full){
    ["vig","veil","glow"].forEach(c=>{const d=document.createElement("div");d.className="ov "+c;box.appendChild(d)});
    veil=$(".veil",box);glow=$(".glow",box);
  }
  const p=Spring(140,13,0,v=>{
    const q=Math.max(0,v);
    disp.setAttribute("scale",(1+(maxScale-1)*q).toFixed(2));
    turb.setAttribute("baseFrequency",(.009+(.022-.009)*q).toFixed(5));
    if(Math.abs(v)<.001){media.style.filter="";} else media.style.filter=`url(#${id})`;
  });
  const r=full?Spring(220,26,0,v=>{veil.style.opacity=(.88*(1-Math.min(1,Math.max(0,v)))).toFixed(3);glow.style.opacity=Math.min(1,Math.max(0,v)).toFixed(3)}):null;
  const enter=()=>{if(!hoverOK())return;p.to(1);r&&r.to(1)};
  const leave=()=>{p.to(0);r&&r.to(0)};
  box.addEventListener("pointerenter",enter);box.addEventListener("pointerleave",leave);
  const card=box.closest(".card"); if(card){card.addEventListener("focus",enter);card.addEventListener("blur",leave);}
}
window.__liquid=liquid;
$$("[data-liquid]").forEach(b=>liquid(b,+b.dataset.liquid));
if(!hoverOK()) document.documentElement.style.setProperty("--veil","0");


function splitWords(el){
  const txt=el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label",el.textContent.trim());
  el.innerHTML=txt.map(w=>`<span class="wd" aria-hidden="true"><span>${w.replace(/&/g,"&amp;")}</span></span>`).join(" ");
}
function lineIndex(el){
  let last=-1,li=-1;
  $$(".wd",el).forEach(w=>{const t=w.offsetTop;if(Math.abs(t-last)>4){li++;last=t;}w.firstChild.style.setProperty("--l",li);w.style.setProperty("--ld",li);
    w.firstChild.style.transitionDelay=`calc(${li}*90ms)`;});
}
$$("[data-split]").forEach(splitWords);
async function layout(){ if(document.fonts&&document.fonts.ready) await document.fonts.ready; $$("[data-split]").forEach(lineIndex); }
layout(); addEventListener("resize",layout);


$$("[data-letters]").forEach(el=>{
  el.innerHTML="<span>"+[...el.dataset.letters].map((c,i)=>`<span class="ch" style="--i:${i};--b:${el.dataset.b}">${c}</span>`).join("")+"</span>";
});


function fitName(){
  const h=$("#name"); h.style.fontSize="";
  const w=Math.max(...$$(".ln>span",h).map(e=>e.getBoundingClientRect().width));
  const max=innerWidth*.94;
  if(w>max){h.style.fontSize=(parseFloat(getComputedStyle(h).fontSize)*max/w)+"px";}
}
(async()=>{if(document.fonts&&document.fonts.ready)await document.fonts.ready;fitName()})();
addEventListener("resize",fitName);


const words=["Video Editing","Photography","Gaming","School Works","Mamburao, Mindoro"];
$("#track").innerHTML=[...words,...words].map(w=>`<span>${w}</span>`).join("");


const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}));
const observe=r=>$$(".rv,.sp",r).forEach(el=>io.observe(el));
observe(document);


const pre=$("#pre"), cnt=$("#cnt");
function heroReveal(){
  const d=reduce?0:1;
  setTimeout(()=>$("#name").classList.add("go"),reduce?0:2500);
  setTimeout(()=>$("#roles").classList.add("on"),reduce?0:2700);
  setTimeout(()=>$("#hdesc").classList.add("on"),reduce?0:2900);
  setTimeout(()=>$("#cue").classList.add("on"),reduce?0:3400);
}
heroReveal();
if(reduce){ pre.remove(); }
else{
  const t0=performance.now();
  (function tick(now){
    const t=Math.min((now-t0)/2000,1);
    cnt.textContent=Math.round(t*100);
    if(t<1)return requestAnimationFrame(tick);
    pre.classList.add("fade");
    setTimeout(()=>{
      pre.classList.add("wipe");
      pre.addEventListener("transitionend",function f(e){
        if(e.target!==pre||e.propertyName!=="transform")return;
        pre.removeEventListener("transitionend",f);
        pre.style.pointerEvents="none";pre.setAttribute("aria-hidden","true");pre.style.display="none";
        lenis.start();
      });
      setTimeout(()=>{lenis.start()},1200);
    },500);
  })(t0);
}

const portfolioData=[
 {id:1,title:'Trap Edit',category:'VideoEditing',mediaType:'video',media:'Assets/videos/Work.mp4',description:'Satus:Private Posted:2023'},
 {id:2,title:'Blur Shot',category:'Photography',mediaType:'image',media:'Assets/images/Photography1.jpg',description:'Portrait Shot'},
 {id:3,title:'Character Showcase Gameplay',category:'Gaming',mediaType:'video',media:'Assets/videos/Gaming1.mp4',description:'Testing an Special access Unreleased Characrter'},
 {id:4,title:'IHCI project',category:'School',mediaType:'image',media:'Assets/images/school1.png',description:'UI design for IHCI'},
 {id:5,title:'Landscape Night Shot',category:'Photography',mediaType:'image',media:'Assets/images/Photography2.jpg',description:'Landscape Night Photography'},
 {id:6,title:'Special Event Edit',category:'VideoEditing',mediaType:'video',media:'Assets/videos/Work2.mp4',description:'Satus:Private Posted:2024'},
 {id:7,title:'Honkai Star Rail Gameplay',category:'Gaming',mediaType:'video',media:'Assets/videos/Gaming2.mp4',description:'Honkai Star Rail Character Gameplay'},
 {id:8,title:'ITC Project',category:'School',mediaType:'image',media:'Assets/images/school2.png',description:'ITC Project - Old Web Portfolio'},
 {id:9,title:'Close-up shot',category:'Photography',mediaType:'image',media:'Assets/images/Photography3.jpg',description:'Macro / Close-up with shallow depth of field'},
 {id:10,title:'Genshin Impact Gameplay',category:'Gaming',mediaType:'video',media:'Assets/videos/Gaming3.mp4',description:'Genshin Impact Exploration'},
 {id:11,title:'Trend Edit',category:'VideoEditing',mediaType:'video',media:'Assets/videos/Work3.mp4',description:'Satus:Private Posted:2023'},
 {id:12,title:'Discrete Mathematics',category:'School',mediaType:'image',media:'Assets/images/school3.png',description:'Discrete Mathematics Project'}
];
const catLabel={Photography:"Photography",VideoEditing:"Video Editing",Gaming:"Gaming",School:"School Works"};
const grid=$("#grid"), moreBtn=$("#more"), wcount=$("#wcount");
let filter="all", shown=6;
const items=portfolioData.map(it=>{
  const li=document.createElement("li");
  li.className="rv hide"; li.dataset.cat=it.category;
  const vid=it.mediaType==="video";
  const m=vid?`<video src="${it.media}#t=0.6" muted loop playsinline preload="metadata"></video>`:`<img src="${it.media}" alt="${it.title}" loading="lazy">`;
  li.innerHTML=`<button class="card" aria-label="Open ${it.title}">
    <div class="liq" style="aspect-ratio:16/11;width:100%;border-radius:.125rem">${m}<span class="badge ${vid?'v':''}">${catLabel[it.category]}</span></div>
    <div class="meta"><div><h3>${it.title}</h3><p>${it.description}</p></div><div class="yr">${vid?'Video':'Photo'}</div></div>
  </button>`;
  grid.appendChild(li);
  const box=$(".liq",li); liquid(box,28);
  const v=$("video",li);
  if(v){box.addEventListener("pointerenter",()=>{if(hoverOK())v.play().catch(()=>{})});box.addEventListener("pointerleave",()=>{v.pause()});}
  $(".card",li).addEventListener("click",()=>openLb(it));
  return {li,it};
});
function render(){
  const pool=items.filter(x=>filter==="all"||x.it.category===filter);
  items.forEach(x=>x.li.classList.add("hide"));
  pool.slice(0,shown).forEach((x,i)=>{
    x.li.classList.remove("hide");
    if(!x.li.classList.contains("in")){x.li.style.setProperty("--d",(i%2)*120+"ms");io.observe(x.li);}
  });
  moreBtn.parentElement.style.display=pool.length>shown?"flex":"none";
  wcount.textContent=String(pool.length).padStart(2,"0")+" / Works";
}
$("#filters").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  $$("#filters button").forEach(x=>x.classList.toggle("act",x===b));
  filter=b.dataset.f;shown=6;render();
});
moreBtn.addEventListener("click",()=>{shown+=6;render();});
render();


const lb=$("#lb"), stage=$("#stage");
function openLb(it){
  stage.innerHTML=it.mediaType==="video"?`<video src="${it.media}" controls autoplay loop playsinline></video>`:`<img src="${it.media}" alt="${it.title}">`;
  $("#lbcap").textContent=it.title+" — "+it.description;
  lb.classList.add("open");lenis.stop();
}
function closeLb(){lb.classList.remove("open");stage.innerHTML="";lenis.start();}
$("#lbx").addEventListener("click",closeLb);
lb.addEventListener("click",e=>{if(e.target===lb)closeLb()});
addEventListener("keydown",e=>{if(e.key==="Escape")closeLb()});


const schools=[
 {name:"Mamburao Central School (MCS)",foot:"Graduated: 2018",img:"Assets/images/MCS.jpg",alt:"MCS School"},
 {name:"West Mindoro Academy (WEMA)",foot:"Graduated: 2024",img:"Assets/images/WEMA.jpg",alt:"WEMA School"},
 {name:"Occidental Mindoro State College (OMSC)",foot:"Status: BSIT 2C Student",img:"Assets/images/OMSCG.jpg",alt:"OMSC School"}
];
const ptitle=$("#ptitle"),pfoot=$("#pfoot"),pimg=$("#pimg");
let cur=-1;
function setSchool(i){
  if(i===cur)return;cur=i;
  $$("#sel button").forEach((b,j)=>b.classList.toggle("act",j===i));
  const s=schools[i];
  ptitle.classList.remove("qgo");
  ptitle.setAttribute("aria-label",s.name);
  ptitle.innerHTML="“"+s.name.split(" ").map((w,k)=>`<span class="qw" style="--i:${k}" aria-hidden="true">${w}</span>`).join(" ")+"”";
  void ptitle.offsetWidth; ptitle.classList.add("qgo");
  pfoot.textContent=s.foot;
  pimg.style.opacity=0;
  setTimeout(()=>{pimg.src=s.img;pimg.alt=s.alt;pimg.style.opacity=1},160);
}
$$("#sel button").forEach(b=>{
  const go=()=>setSchool(+b.dataset.i);
  b.addEventListener("click",go);b.addEventListener("focus",go);
  b.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")go()});
});
setSchool(0);
