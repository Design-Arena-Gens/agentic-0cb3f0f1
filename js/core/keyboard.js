(function(){
  function init(){
    window.addEventListener('keydown', (e)=>{
      if(WebOS.utils.isMeta(e) && e.key.toLowerCase()==='m'){ e.preventDefault(); WebOS.bus.emit('mission:toggle'); }
      if(WebOS.utils.isMeta(e) && e.key.toLowerCase()==='w'){ e.preventDefault(); if(WebOS.wm.activeId) WebOS.bus.emit('window:close', WebOS.wm.activeId); }
      if(WebOS.utils.isMeta(e) && e.key.toLowerCase()==='h'){ e.preventDefault(); WebOS.bus.emit('window:minimize-active'); }
    });
  }
  init();
})();
