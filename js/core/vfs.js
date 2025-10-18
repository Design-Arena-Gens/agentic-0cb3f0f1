(function(){
  const MANIFEST = 'vfs.json';
  let fs = { path:'/', type:'dir', name:'/', children:[] };
  async function load(){
    try{
      const res = await fetch(MANIFEST, { cache:'no-store' }); if(res.ok){ fs = await res.json(); }
    }catch(e){ console.warn('VFS load failed', e); }
  }
  function get(){ return fs; }
  function find(pathParts){
    let node = fs; for(const part of pathParts){ if(!part) continue; node = (node.children||[]).find(c=> c.name===part); if(!node) return null; }
    return node;
  }
  function list(path){ const parts = path.split('/'); const node = find(parts); return node && node.children ? node.children : []; }
  function createFile(path, file){ /* simulate */ WebOS.bus.emit('vfs:changed'); }
  function remove(path){ WebOS.bus.emit('vfs:changed'); }
  WebOS.vfs = { load, get, list, createFile, remove };
})();
