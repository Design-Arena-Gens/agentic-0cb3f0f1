(function(){
  const registry = new Map();
  function register(app){
    if(!app || !app.id) throw new Error('App must have id');
    registry.set(app.id, app);
    WebOS.bus.emit('app:registered', app);
  }
  function list(){ return Array.from(registry.values()); }
  function get(id){ return registry.get(id); }
  WebOS.apps = { register, list, get };
})();
