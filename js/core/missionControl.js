(function(){
  let open = false;
  function toggle(){
    open = !open; const mc = document.getElementById('mission-control');
    mc.classList.toggle('hidden', !open);
    if(open){
      renderTiles();
    } else {
      mc.innerHTML = '';
    }
  }
  function renderTiles(){
    const mc = document.getElementById('mission-control'); mc.innerHTML = '';
    mc.style.position='absolute'; mc.style.inset='0'; mc.style.backdropFilter='blur(40px)'; mc.style.background='rgba(255,255,255,0.2)';
    const windows = document.querySelectorAll('.window');
    windows.forEach(w=>{
      const tile = w.cloneNode(true); tile.style.pointerEvents='none'; tile.style.transform='scale(0.6)'; tile.style.position='static'; tile.style.margin='20px';
      mc.appendChild(tile);
    });
  }
  function init(){
    WebOS.bus.on('mission:toggle', toggle);
  }
  WebOS.mission = { init, toggle };
})();
