(function(){
  const subscribers = new Map();
  function on(event, handler){
    if(!subscribers.has(event)) subscribers.set(event, new Set());
    subscribers.get(event).add(handler);
    return () => off(event, handler);
  }
  function off(event, handler){
    const set = subscribers.get(event); if(!set) return; set.delete(handler);
  }
  function emit(event, payload){
    const set = subscribers.get(event); if(!set) return; for(const cb of set){ try{ cb(payload); }catch(e){ console.error(e);} }
  }
  WebOS.bus = { on, off, emit };
})();
