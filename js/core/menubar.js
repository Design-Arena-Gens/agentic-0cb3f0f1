(function(){
  function init(){
    const container = document.getElementById('menubar');
    const clock = document.getElementById('clock');
    const menus = document.getElementById('app-menus');

    function updateClock(){
      const d = new Date();
      const opts = { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' };
      clock.textContent = new Intl.DateTimeFormat(undefined, opts).format(d);
    }
    setInterval(updateClock, 1000); updateClock();

    function renderMenus(appId){
      menus.innerHTML = '';
      const defs = WebOS.apps.get(appId)?.menus || defaultMenus();
      defs.forEach(group => {
        const wrap = document.createElement('div'); wrap.className='menu';
        const btn = document.createElement('button'); btn.textContent = group.title; wrap.appendChild(btn);
        const dd = document.createElement('div'); dd.className='dropdown hidden'; wrap.appendChild(dd);
        group.items.forEach(it=>{
          const b = document.createElement('button'); b.textContent = it.label; b.addEventListener('click', ()=>{ it.action?.(); dd.classList.add('hidden'); }); dd.appendChild(b);
        });
        btn.addEventListener('click', ()=> dd.classList.toggle('hidden'));
        menus.appendChild(wrap);
      });
    }

    WebOS.bus.on('app:activated', (appId)=>{
      document.getElementById('active-app-title').textContent = WebOS.apps.get(appId)?.title || 'App';
      renderMenus(appId);
    });

    renderMenus('finder');

    // Tooltips/status icons
    const status = document.getElementById('status-icons');
    status.innerHTML = '';
    const wifi = document.createElement('span'); wifi.textContent='📶'; wifi.title='Wi‑Fi: On'; wifi.style.padding='0 6px';
    const battery = document.createElement('span'); battery.textContent='🔋'; battery.title='Battery: 100%'; battery.style.padding='0 6px';
    status.append(wifi, battery);
  }

  function defaultMenus(){
    return [
      { title:'File', items:[ { label:'New Window', action: ()=> WebOS.bus.emit('finder:new-window') } ] },
      { title:'Edit', items:[ { label:'Copy', action: ()=> document.execCommand('copy') } ] },
      { title:'View', items:[ { label:'Mission Control', action: ()=> WebOS.bus.emit('mission:toggle') } ] },
      { title:'Go', items:[ { label:'Home', action: ()=> WebOS.bus.emit('finder:go', 'home') } ] },
      { title:'Window', items:[ { label:'Minimize', action: ()=> WebOS.bus.emit('window:minimize-active') } ] },
      { title:'Help', items:[ { label:'About This WebOS', action: ()=> WebOS.bus.emit('about:open') } ] },
    ];
  }

  WebOS.menubar = { init };
})();
