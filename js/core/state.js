(function(){
  const LS_KEY = 'webos-state-v1';
  const state = {
    windows: {},
    apps: {},
    prefs: { accentColor: '#0a84ff', reduceTransparency: false },
  };
  function load(){
    try{ const raw = localStorage.getItem(LS_KEY); if(raw){ Object.assign(state, JSON.parse(raw)); } }catch(e){}
  }
  function save(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){}
  }
  function setAppState(appId, data){ state.apps[appId] = { ...(state.apps[appId]||{}), ...data }; save(); }
  function getAppState(appId){ return state.apps[appId] || {}; }
  WebOS.state = { state, load, save, setAppState, getAppState };
})();
