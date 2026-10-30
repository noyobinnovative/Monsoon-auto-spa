(function(){
  const WA = "919847012345";
  const VEH = {hatch:"Hatchback", sedan:"Sedan", suv:"SUV / MUV", bike:"Two-wheeler"};
  const PKGS = [
    {id:"express", name:"Express", time:"About 25 minutes", price:{hatch:349,sedan:399,suv:499,bike:199},
     items:["Exterior rinse and hand dry","Tyre shine","Glass cleaning"]},
    {id:"shine", name:"Monsoon Shine", time:"About 1 hour", best:true, price:{hatch:799,sedan:899,suv:1099,bike:349},
     items:["Snow-foam pre-wash and hand wash","Interior vacuum and wipe-down","Wheel and arch cleaning","Spray wax for 2 weeks of beading"]},
    {id:"detail", name:"Full Detail", time:"3 to 4 hours", price:{hatch:2499,sedan:2999,suv:3499,bike:899},
     items:["Everything in Monsoon Shine","Seat and carpet shampoo","Clay bar and machine polish","AC vent and odour treatment","Free pick-up within 5 km"]}
  ];
  const ADDONS = [
    {id:"engine", name:"Engine bay", price:699},
    {id:"headlight", name:"Headlight restore", price:599},
    {id:"odour", name:"Odour treatment", price:399}
  ];
  const PICKUP = 199;
  const $ = s=>document.querySelector(s);
  const inr = n=>"₹"+n.toLocaleString("en-IN");
  const store = {
    get(){try{return JSON.parse(localStorage.getItem("msa-bookings")||"[]")}catch(e){return[]}},
    set(v){try{localStorage.setItem("msa-bookings",JSON.stringify(v))}catch(e){}}
  };
  function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2600)}

  /* header + menu */
  const head=$(".site-head"), nav=$("#nav"), mb=$(".menu-btn");
  const onScroll=()=>head.classList.toggle("solid", scrollY>40 || nav.classList.contains("open"));
  addEventListener("scroll",onScroll,{passive:true}); onScroll();
  mb.addEventListener("click",()=>{const o=nav.classList.toggle("open");mb.setAttribute("aria-expanded",o);mb.setAttribute("aria-label",o?"Close menu":"Open menu");onScroll()});
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");mb.setAttribute("aria-expanded","false");onScroll()}));

  /* video */
  const v=$("#heroVid"), vt=$("#vidToggle"), vi=$("#vidIco");
  const PAUSE='<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>', PLAY='<path d="M8 5l11 7-11 7z"/>';
  function setVid(play){ if(play){v.play().catch(()=>{});vi.innerHTML=PAUSE;vt.setAttribute("aria-label","Pause background video")} else {v.pause();vi.innerHTML=PLAY;vt.setAttribute("aria-label","Play background video")} }
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) setVid(false);
  vt.addEventListener("click",()=>setVid(v.paused));

  /* packages section */
  let veh="hatch";
  function renderPk(){
    $("#pkGrid").innerHTML=PKGS.map(p=>`
      <article class="pk${p.best?" best":""}">
        ${p.best?'<span class="tag">Most booked</span>':""}
        <h3>${p.name}</h3><div class="time">${p.time}</div>
        <div class="price">${inr(p.price[veh])} <small>${VEH[veh]}</small></div>
        <ul>${p.items.map(i=>`<li><svg width="14" height="14"><use href="#check"/></svg>${i}</li>`).join("")}</ul>
        <a class="btn ${p.best?"":"btn-petrol"}" href="#book" data-pick="${p.id}">Book ${p.name}</a>
      </article>`).join("");
  }
  $("#vehSeg").addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b) return;
    veh=b.dataset.veh;
    $("#vehSeg").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));
    renderPk();
  });
  $("#pkGrid").addEventListener("click",e=>{
    const a=e.target.closest("[data-pick]"); if(!a) return;
    const vr=document.querySelector(`input[name=veh][value=${veh}]`); if(vr) vr.checked=true;
    const pr=document.querySelector(`input[name=pkg][value=${a.dataset.pick}]`); if(pr) pr.checked=true;
    showForm(); update();
  });
  renderPk();

  /* booking form */
  $("#vehChoices").innerHTML=Object.entries(VEH).map(([k,n],i)=>`<label class="choice"><input type="radio" name="veh" value="${k}" ${i===0?"checked":""}><span>${n}</span></label>`).join("");
  function renderPkgChoices(){
    const cur=(document.querySelector("input[name=pkg]:checked")||{}).value||"shine";
    const vv=document.querySelector("input[name=veh]:checked").value;
    $("#pkgChoices").innerHTML=PKGS.map(p=>`<label class="choice"><input type="radio" name="pkg" value="${p.id}" ${p.id===cur?"checked":""}><span>${p.name}<small>${inr(p.price[vv])}</small></span></label>`).join("");
  }
  $("#addonChoices").innerHTML=ADDONS.map(a=>`<label class="choice"><input type="checkbox" name="addon" value="${a.id}"><span>${a.name}<small>+ ${inr(a.price)}</small></span></label>`).join("");
  renderPkgChoices();

  const dateEl=$("#date"), slotEl=$("#slot");
  const pad=n=>String(n).padStart(2,"0");
  const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const today=new Date(); const max=new Date(); max.setDate(max.getDate()+30);
  dateEl.min=iso(today); dateEl.max=iso(max);
  function fmtSlot(h){const ap=h<12?"am":"pm";const hh=h%12||12;return `${hh}:00 ${ap}`}
  function renderSlots(){
    const prev=slotEl.value; const now=new Date();
    const isToday=dateEl.value===iso(now);
    let html='<option value="">Choose a time</option>', any=false;
    for(let h=7;h<=18;h++){
      const past=isToday && (h<=now.getHours());
      if(!past) any=true;
      html+=`<option value="${h}" ${past?"disabled":""}>${fmtSlot(h)}${past?" (passed)":""}</option>`;
    }
    slotEl.innerHTML=html;
    if(prev && slotEl.querySelector(`option[value="${prev}"]:not([disabled])`)) slotEl.value=prev;
    if(isToday && !any){ $("#dateErr").textContent="No slots left today. Pick tomorrow or later."; }
  }
  // default: tomorrow if late
  const def=new Date(); if(def.getHours()>=18) def.setDate(def.getDate()+1);
  dateEl.value=iso(def); renderSlots();

  function state(){
    const vv=document.querySelector("input[name=veh]:checked").value;
    const pid=document.querySelector("input[name=pkg]:checked").value;
    const p=PKGS.find(x=>x.id===pid);
    const adds=[...document.querySelectorAll("input[name=addon]:checked")].map(i=>ADDONS.find(a=>a.id===i.value));
    const pickup=$("#pickup").checked;
    const pickupFee=pickup?(pid==="detail"?0:PICKUP):0;
    const total=p.price[vv]+adds.reduce((s,a)=>s+a.price,0)+pickupFee;
    return {vv,p,adds,pickup,pickupFee,total};
  }
  function update(){
    const s=state();
    const rows=[[VEH[s.vv]+", "+s.p.name, inr(s.p.price[s.vv])], ...s.adds.map(a=>[a.name, inr(a.price)])];
    if(s.pickup) rows.push(["Pick-up and drop", s.pickupFee?inr(s.pickupFee):"Free"]);
    if(dateEl.value){
      const d=new Date(dateEl.value+"T00:00");
      rows.push(["Date", d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})]);
    }
    if(slotEl.value) rows.push(["Time", fmtSlot(+slotEl.value)]);
    $("#sumRows").innerHTML=rows.map(r=>`<div class="sum-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
    $("#sumTotal").textContent=inr(s.total);
    $("#addrWrap").hidden=!s.pickup;
  }
  const form=$("#bookForm");
  form.addEventListener("change",e=>{
    if(e.target.name==="veh") renderPkgChoices();
    if(e.target===dateEl){ $("#dateErr").textContent=""; renderSlots(); }
    update();
  });
  form.addEventListener("input",e=>{ if(e.target.getAttribute("aria-invalid")) validateField(e.target.id) });

  function setErr(id,msg){const el=$("#"+id);el.setAttribute("aria-invalid",msg?"true":"false");$("#"+id+"Err").textContent=msg||""}
  function validateField(id){
    const val=($("#"+id).value||"").trim();
    if(id==="name") return setErr(id, val.length<2?"Enter your name.":""), val.length>=2;
    if(id==="phone"){const d=val.replace(/\D/g,"").replace(/^91(?=\d{10}$)/,"");const ok=/^[6-9]\d{9}$/.test(d);setErr(id,ok?"":"Enter a valid 10-digit mobile number.");return ok}
    if(id==="date"){const ok=val && val>=dateEl.min && val<=dateEl.max;setErr(id,ok?"":"Choose a date within the next 30 days.");return ok}
    if(id==="slot"){const ok=!!val;setErr(id,ok?"":"Choose a time slot.");return ok}
    if(id==="addr"){const need=$("#pickup").checked;const ok=!need||val.length>=8;setErr(id,ok?"":"Enter the pick-up address.");return ok}
    return true;
  }
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const ids=["date","slot","addr","name","phone"];
    const bad=ids.filter(id=>!validateField(id));
    if(bad.length){ $("#"+bad[0]).focus(); toast("Check the highlighted fields."); return; }
    const s=state();
    const ref="MSA-"+Math.random().toString(36).slice(2,7).toUpperCase();
    const b={ref, veh:VEH[s.vv], pkg:s.p.name, adds:s.adds.map(a=>a.name), date:dateEl.value, slot:+slotEl.value,
      pickup:s.pickup, addr:$("#addr").value.trim(), name:$("#name").value.trim(), phone:$("#phone").value.trim(), car:$("#car").value.trim(), total:s.total};
    const all=store.get(); all.unshift(b); store.set(all);
    const d=new Date(b.date+"T00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
    $("#doneRef").textContent=ref;
    $("#doneMsg").textContent=`${b.pkg} for your ${b.veh} on ${d} at ${fmtSlot(b.slot)}. Total ${inr(b.total)}, paid after the wash.`;
    const msg=`Hi Monsoon Auto Spa, I booked ${ref}:\n${b.pkg} (${b.veh})${b.adds.length?"\nAdd-ons: "+b.adds.join(", "):""}\n${d}, ${fmtSlot(b.slot)}${b.pickup?"\nPick-up from: "+b.addr:""}${b.car?"\nCar: "+b.car:""}\nTotal: ${inr(b.total)}\nName: ${b.name}, ${b.phone}`;
    $("#waLink").href=`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    form.hidden=true; $("#done").classList.add("show"); $("#submitBtn").disabled=true; $("#submitBtn").style.opacity=.5;
    renderMine(); $("#done").scrollIntoView({block:"center"});
  });
  function showForm(){ form.hidden=false; $("#done").classList.remove("show"); $("#submitBtn").disabled=false; $("#submitBtn").style.opacity=1; }
  $("#newBooking").addEventListener("click",()=>{ form.reset(); dateEl.value=iso(def); renderPkgChoices(); renderSlots(); ["name","phone","addr","date","slot"].forEach(id=>setErr(id,"")); showForm(); update(); });

  function renderMine(){
    const all=store.get(); $("#mine").hidden=!all.length;
    $("#mineList").innerHTML=all.map(b=>{
      const d=new Date(b.date+"T00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"});
      return `<div class="mine-item"><div><b>${b.ref}</b> ${b.pkg}, ${b.veh}<small>${d} at ${fmtSlot(b.slot)}, ${inr(b.total)}</small></div><button type="button" data-cancel="${b.ref}">Cancel</button></div>`}).join("");
  }
  $("#mineList").addEventListener("click",e=>{
    const r=e.target.closest("[data-cancel]")?.dataset.cancel; if(!r) return;
    if(!confirm(`Cancel booking ${r}?`)) return;
    store.set(store.get().filter(b=>b.ref!==r)); renderMine(); toast(`Booking ${r} cancelled.`);
  });
  renderMine(); update();

  /* before/after */
  const cmp=$("#compare"), rng=$("#baRange");
  rng.addEventListener("input",()=>cmp.style.setProperty("--pos",rng.value+"%"));

  /* theme */
  const tb=$("#themeBtn"), root=document.documentElement;
  const isDark=()=>root.dataset.theme? root.dataset.theme==="dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const label=()=>tb.textContent=isDark()?"Switch to light mode":"Switch to dark mode";
  try{const t=localStorage.getItem("msa-theme"); if(t) root.dataset.theme=t;}catch(e){}
  label();
  tb.addEventListener("click",()=>{root.dataset.theme=isDark()?"light":"dark";try{localStorage.setItem("msa-theme",root.dataset.theme)}catch(e){};label()});

  $("#yr").textContent=new Date().getFullYear();
})();
