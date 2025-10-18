(function(){
  function init(){
    const windowsRoot = document.getElementById('windows');
    WebOS.wm = new WebOS.WindowManager(windowsRoot);
    WebOS.menubar.init();
    WebOS.dock.init();
    WebOS.mission.init();

    // Global handlers
    WebOS.bus.on('window:minimize-active', ()=>{ if(WebOS.wm.activeId) WebOS.bus.emit('window:minimize', WebOS.wm.activeId); });

    // About dialog
    WebOS.bus.on('about:open', ()=>{
      const { content } = WebOS.wm.create({ title:'About This WebOS', width:420, height:260 });
      content.innerHTML = `<div style="padding:20px;line-height:1.6">
        <h2 style="margin:0 0 8px">macOS WebOS</h2>
        <div>Version 1.0 (Monterey-inspired)</div>
        <div>© ${(new Date()).getFullYear()} WebOS Team</div>
      </div>`;
    });

    // Activate Finder by default
    WebOS.bus.emit('app:activated', 'finder');
  }
  WebOS.init = init;
})();
