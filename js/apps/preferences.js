(function(){
  const id='preferences'; const title='System Preferences';
  function open(){
    const { content } = WebOS.wm.create({ appId:id, title, width:720, height:520 });
    content.innerHTML = `<div class='prefs'>
      <div class='grid'>
        <button data-key='accentColor'><span class='icon' style='background:var(--accent)'></span><span>Appearance</span></button>
        <button data-key='reduceTransparency'><span class='icon'></span><span>Accessibility</span></button>
      </div>
      <div class='panel' id='prefs-panel'></div>
    </div>`;
    style(); bind(content);
  }
  function style(){ if(document.getElementById('prefs-style')) return; const s=document.createElement('style'); s.id='prefs-style'; s.textContent=`
    .prefs{height:100%;display:grid;grid-template-columns:280px 1fr}
    .grid{padding:12px;display:grid;grid-template-columns:1fr; gap:8px;background:rgba(255,255,255,.5)}
    .grid button{display:flex;align-items:center;gap:10px;border:0;background:#fff;border-radius:12px;padding:10px 12px;box-shadow:var(--win-shadow)}
    .grid .icon{width:28px;height:28px;border-radius:6px;background:#ddd}
    .panel{padding:16px}
    .row{display:flex;align-items:center;gap:8px;margin:10px 0}
    .switch{width:44px;height:26px;border-radius:26px;background:#d1d1d6;position:relative}
    .switch .knob{position:absolute;width:22px;height:22px;left:2px;top:2px;border-radius:50%;background:#fff;transition:left .2s}
    .switch.on{background:var(--accent)} .switch.on .knob{left:20px}
  `; document.head.appendChild(s);} 
  function bind(root){
    const panel = root.querySelector('#prefs-panel');
    root.querySelectorAll('.grid button').forEach(b=> b.addEventListener('click', ()=>{
      if(b.dataset.key==='accentColor') showAppearance(panel);
      if(b.dataset.key==='reduceTransparency') showAccessibility(panel);
    }));
    showAppearance(panel);
  }
  function showAppearance(panel){
    panel.innerHTML = `<h3>Appearance</h3>
      <div class='row'>Accent Color: <input type='color' id='accent' value='${WebOS.state.state.prefs.accentColor}'/></div>`;
    panel.querySelector('#accent').addEventListener('input', (e)=>{
      document.documentElement.style.setProperty('--accent', e.target.value);
      WebOS.state.state.prefs.accentColor = e.target.value; WebOS.state.save();
    });
  }
  function showAccessibility(panel){
    const on = !!WebOS.state.state.prefs.reduceTransparency;
    panel.innerHTML = `<h3>Accessibility</h3>
      <div class='row'>Reduce transparency: <div class='switch ${on?'on':''}' id='sw'><div class='knob'></div></div></div>`;
    const sw = panel.querySelector('#sw');
    sw.addEventListener('click', ()=>{
      sw.classList.toggle('on');
      WebOS.state.state.prefs.reduceTransparency = sw.classList.contains('on'); WebOS.state.save();
      document.querySelectorAll('.window').forEach(w=> w.style.backdropFilter = sw.classList.contains('on') ? 'none' : 'saturate(180%) blur(30px)');
    });
  }

  WebOS.apps.register({ id, title, open });
  WebOS.bus.on('preferences:open', open);
})();
