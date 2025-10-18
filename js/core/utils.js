window.WebOS = window.WebOS || {};
(function(){
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2,9)}`;
  const now = () => Date.now();
  const isMeta = (e) => navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;
  const sf = (num, decimals=2) => Number(num.toFixed(decimals));

  WebOS.utils = { clamp, uid, now, isMeta, sf };
})();
