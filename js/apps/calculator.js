(function(){
  const id = 'calculator';
  const title = 'Calculator';
  const layoutBasic = [
    ['AC','±','%','÷'],
    ['7','8','9','×'],
    ['4','5','6','−'],
    ['1','2','3','+'],
    ['0','.','=','']
  ];
  const layoutSci = [
    ['2nd','x²','x³','xʸ','eˣ','10ˣ','ln','log₁₀'],
    ['x!','√x','³√x','ᵧ√x','1/x','%','sin','cos'],
    ['tan','sinh','cosh','tanh','e','EE','Rad','Deg']
  ];

  function open(){
    const { content } = WebOS.wm.create({ appId:id, title, width:320, height:460 });
    content.innerHTML = `<div class="calc">
      <div class="calc-display" id="calc-display">0</div>
      <div class="calc-keys" id="calc-keys"></div>
      <div class="calc-sci hidden" id="calc-sci"></div>
    </div>`;
    style();
    renderKeys();
  }
  function style(){
    if(document.getElementById('calc-style')) return;
    const s = document.createElement('style'); s.id='calc-style';
    s.textContent = `.calc{height:100%;display:grid;grid-template-rows:100px 1fr auto;padding:12px}
    .calc-display{background:#1c1c1e;color:#fff;border-radius:12px;padding:16px;font-size:42px;text-align:right}
    .calc-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
    .calc-keys button{height:52px;border:0;border-radius:12px;font-size:18px;background:#e5e5ea}
    .op{background:#ff9f0a;color:#fff}
    .wide{grid-column:span 2}
    #calc-sci{display:grid;grid-template-columns:repeat(8,1fr);gap:8px;margin-top:10px}
    #calc-sci button{height:36px;border:0;border-radius:10px;background:#d1d1d6}
    .toolbar{display:flex;gap:8px;margin-top:8px}
    .toolbar button{border:0;background:#f2f2f7;border-radius:8px;padding:6px 10px}
    `;
    document.head.appendChild(s);
  }
  function renderKeys(){
    const keys = document.getElementById('calc-keys'); const sci = document.getElementById('calc-sci'); keys.innerHTML=''; sci.innerHTML='';
    layoutBasic.forEach(row=> row.forEach(k=>{
      if(!k) return; const b = document.createElement('button'); b.textContent = k; if('÷×−+'.includes(k) || k==='=') b.classList.add('op');
      if(k==='0'){ b.classList.add('wide'); }
      b.addEventListener('click', ()=> press(k)); keys.appendChild(b);
    }));
    layoutSci.forEach(row=> row.forEach(k=>{ const b=document.createElement('button'); b.textContent=k; b.addEventListener('click', ()=> press(k)); sci.appendChild(b); }));
    const toolbar = document.createElement('div'); toolbar.className='toolbar';
    const toggle = document.createElement('button'); toggle.textContent='Scientific'; toggle.addEventListener('click', ()=> sci.classList.toggle('hidden'));
    toolbar.appendChild(toggle); keys.parentElement.appendChild(toolbar);
    bindShortcuts();
  }

  let acc = 0, cur = '0', op = null, deg = true, memory = 0;
  function update(){ const d = document.getElementById('calc-display'); if(d) d.textContent = cur; }
  function press(k){
    if(/^[0-9]$/.test(k)) { cur = (cur==='0'? k : cur + k); }
    else if(k==='.') { if(!cur.includes('.')) cur += '.'; }
    else if(k==='AC'){ acc=0; cur='0'; op=null; }
    else if(k==='±'){ if(cur.startsWith('-')) cur = cur.slice(1); else if(cur!=='0') cur = '-' + cur; }
    else if(k==='%'){ cur = String(WebOS.utils.sf(parseFloat(cur)/100)); }
    else if('÷×−+'.includes(k)) { compute(); op = k; acc = parseFloat(cur); cur='0'; }
    else if(k==='=') { compute(); op=null; }
    else if(k==='Rad'){ deg=false; }
    else if(k==='Deg'){ deg=true; }
    else if(k==='x²'){ cur = String(WebOS.utils.sf(Math.pow(parseFloat(cur),2))); }
    else if(k==='x³'){ cur = String(WebOS.utils.sf(Math.pow(parseFloat(cur),3))); }
    else if(k==='√x'){ cur = String(WebOS.utils.sf(Math.sqrt(parseFloat(cur)))); }
    else if(k==='1/x'){ cur = String(WebOS.utils.sf(1/parseFloat(cur))); }
    else if(k==='sin'){ cur = trig(Math.sin, parseFloat(cur)); }
    else if(k==='cos'){ cur = trig(Math.cos, parseFloat(cur)); }
    else if(k==='tan'){ cur = trig(Math.tan, parseFloat(cur)); }
    update();
  }
  function trig(fn, v){ const rad = deg ? v*Math.PI/180 : v; return String(WebOS.utils.sf(fn(rad))); }
  function compute(){ const a = acc; const b = parseFloat(cur); if(op==='÷') cur = String(WebOS.utils.sf(a/b)); else if(op==='×') cur = String(WebOS.utils.sf(a*b)); else if(op==='−') cur = String(WebOS.utils.sf(a-b)); else if(op==='+') cur = String(WebOS.utils.sf(a+b)); }

  function shortcuts(e){
    if(WebOS.utils.isMeta(e) && e.key.toLowerCase()==='c'){ e.preventDefault(); navigator.clipboard?.writeText(String(cur)); }
    if(WebOS.utils.isMeta(e) && e.key.toLowerCase()==='v'){ e.preventDefault(); navigator.clipboard?.readText().then(t=>{ if(/^[0-9\.\-]+$/.test(t)) { cur = t; update(); } }); }
  }
  function bindShortcuts(){ window.addEventListener('keydown', shortcuts); }

  WebOS.apps.register({ id, title, open, menus:[ { title:'Calculator', items:[ { label:'Quit Calculator', action:()=>{} } ] } ] });
  WebOS.bus.on('calculator:open', open);
})();
