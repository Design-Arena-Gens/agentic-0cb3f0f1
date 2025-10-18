(function(){
  function init(){
    const items = document.getElementById('dock-items');
    const apps = [
      { id:'finder', title:'Finder', icon:'images/icons/finder.svg', action: ()=> WebOS.bus.emit('finder:new-window') },
      { id:'notepad', title:'TextEdit', icon:'images/icons/textedit.svg', action: ()=> WebOS.bus.emit('notepad:new') },
      { id:'calculator', title:'Calculator', icon:'images/icons/calculator.svg', action: ()=> WebOS.bus.emit('calculator:open') },
      { id:'terminal', title:'Terminal', icon:'images/icons/terminal.svg', action: ()=> WebOS.bus.emit('terminal:open') },
      { id:'preferences', title:'System Preferences', icon:'images/icons/preferences.svg', action: ()=> WebOS.bus.emit('preferences:open') },
    ];
    items.innerHTML = '';
    apps.forEach(app=>{
      const el = document.createElement('button'); el.className='dock-item'; el.title = app.title;
      const img = document.createElement('img'); img.src = app.icon; img.alt = app.title; el.appendChild(img);
      el.addEventListener('click', ()=>{ el.classList.add('bounce'); app.action(); setTimeout(()=> el.classList.remove('bounce'), 800); WebOS.bus.emit('app:activated', app.id); });
      items.appendChild(el);
    });
  }
  WebOS.dock = { init };
})();
