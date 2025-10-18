(function(){
  const { uid, clamp } = WebOS.utils;
  const Z_BASE = 100;
  let zTop = Z_BASE;

  class WindowManager{
    constructor(root){
      this.root = root; this.windows = new Map(); this.activeId = null;
      this.restoreFromState();
      WebOS.bus.on('window:create', (cfg)=> this.create(cfg));
      WebOS.bus.on('window:focus', (id)=> this.focus(id));
      WebOS.bus.on('window:close', (id)=> this.close(id));
      WebOS.bus.on('window:minimize', (id)=> this.minimize(id));
      WebOS.bus.on('window:toggle-full', (id)=> this.toggleFull(id));
      window.addEventListener('resize', ()=> this.constrainAll());
    }
    create(cfg){
      const id = cfg.id || uid('win');
      const el = document.createElement('div');
      el.className = 'window'; el.dataset.id = id; el.style.zIndex = ++zTop;
      const titlebar = document.createElement('div'); titlebar.className = 'titlebar';
      const traffic = document.createElement('div'); traffic.className = 'traffic';
      const btnClose = document.createElement('button'); btnClose.className='btn close'; btnClose.title='Close';
      const btnMin = document.createElement('button'); btnMin.className='btn min'; btnMin.title='Minimize';
      const btnZoom = document.createElement('button'); btnZoom.className='btn zoom'; btnZoom.title='Zoom';
      traffic.append(btnClose, btnMin, btnZoom);
      const title = document.createElement('div'); title.className='title'; title.textContent = cfg.title || 'Window';
      titlebar.append(traffic, title);
      const content = document.createElement('div'); content.className='content';
      el.append(titlebar, content);
      const handle = document.createElement('div'); handle.className='resize-handle'; content.appendChild(handle);

      const w = clamp(cfg.width||600, 320, window.innerWidth-40);
      const h = clamp(cfg.height||400, 200, window.innerHeight-140);
      const x = clamp(cfg.x|| 40 + (this.windows.size*24)% (window.innerWidth- w - 40), 10, window.innerWidth - w - 10);
      const y = clamp(cfg.y|| 60 + (this.windows.size*24)% (window.innerHeight- h - 140), 40, window.innerHeight - h - 100);
      Object.assign(el.style, { left: x+"px", top: y+"px", width: w+"px", height: h+"px" });

      this.root.appendChild(el);
      this.bindWindow(el, { id, appId: cfg.appId||null, title: cfg.title||'Window', minimized:false, full:false });
      this.focus(id);
      WebOS.bus.emit('window:created', { id, el, content, cfg });
      return { id, el, content };
    }
    bindWindow(el, meta){
      const id = meta.id; const content = el.querySelector('.content');
      const state = { id, el, content, meta };
      this.windows.set(id, state);
      const titlebar = el.querySelector('.titlebar');
      // dragging
      let drag = null;
      titlebar.addEventListener('mousedown', (e)=>{
        if((e.target).classList && (e.target).classList.contains('btn')) return;
        const rect = el.getBoundingClientRect();
        drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
        this.focus(id);
      });
      window.addEventListener('mousemove', (e)=>{
        if(!drag) return;
        const nx = clamp(e.clientX - drag.dx, 0, window.innerWidth - el.offsetWidth);
        const ny = clamp(e.clientY - drag.dy, 36, window.innerHeight - el.offsetHeight - 80);
        el.style.left = nx + 'px'; el.style.top = ny + 'px';
      });
      window.addEventListener('mouseup', ()=>{ drag = null; this.persist(); });
      // resize
      const handle = el.querySelector('.resize-handle');
      let rs = null;
      handle.addEventListener('mousedown', (e)=>{
        e.stopPropagation(); rs = { startX:e.clientX, startY:e.clientY, w:el.offsetWidth, h:el.offsetHeight };
        this.focus(id);
      });
      window.addEventListener('mousemove', (e)=>{
        if(!rs) return;
        const nw = clamp(rs.w + (e.clientX - rs.startX), 320, window.innerWidth - el.offsetLeft - 10);
        const nh = clamp(rs.h + (e.clientY - rs.startY), 200, window.innerHeight - el.offsetTop - 80);
        el.style.width = nw + 'px'; el.style.height = nh + 'px';
      });
      window.addEventListener('mouseup', ()=>{ if(rs){ rs=null; this.persist(); }});
      // traffic buttons
      el.querySelector('.btn.close').addEventListener('click', ()=> WebOS.bus.emit('window:close', id));
      el.querySelector('.btn.min').addEventListener('click', ()=> WebOS.bus.emit('window:minimize', id));
      el.querySelector('.btn.zoom').addEventListener('click', ()=> WebOS.bus.emit('window:toggle-full', id));
    }
    focus(id){
      const st = this.windows.get(id); if(!st) return; st.el.style.zIndex = ++zTop; this.activeId = id; WebOS.bus.emit('window:focused', id); this.persist();
    }
    minimize(id){
      const st = this.windows.get(id); if(!st) return; st.meta.minimized = true; st.el.style.display='none'; WebOS.bus.emit('window:minimized', id); this.persist();
    }
    toggleFull(id){
      const st = this.windows.get(id); if(!st) return; st.meta.full = !st.meta.full;
      if(st.meta.full){ st.el.dataset.prev = JSON.stringify({ left: st.el.style.left, top: st.el.style.top, width: st.el.style.width, height: st.el.style.height }); Object.assign(st.el.style, { left:'10px', top:'36px', width:(window.innerWidth-20)+'px', height:(window.innerHeight-100)+'px' }); }
      else { const prev = JSON.parse(st.el.dataset.prev||'{}'); Object.assign(st.el.style, prev); st.el.removeAttribute('data-prev'); }
      this.focus(id); this.persist();
    }
    close(id){
      const st = this.windows.get(id); if(!st) return; st.el.remove(); this.windows.delete(id); WebOS.bus.emit('window:closed', id); this.persist();
    }
    constrainAll(){
      for(const st of this.windows.values()){
        const nx = clamp(parseInt(st.el.style.left), 0, window.innerWidth - st.el.offsetWidth);
        const ny = clamp(parseInt(st.el.style.top), 36, window.innerHeight - st.el.offsetHeight - 80);
        st.el.style.left = nx + 'px'; st.el.style.top = ny + 'px';
      }
    }
    persist(){
      const snapshot = {};
      for(const [id, st] of this.windows.entries()){
        snapshot[id] = { meta: st.meta, rect: { left: st.el.style.left, top: st.el.style.top, width: st.el.style.width, height: st.el.style.height }, z: st.el.style.zIndex, hidden: st.el.style.display==='none' };
      }
      WebOS.state.state.windows = snapshot; WebOS.state.save();
    }
    restoreFromState(){
      WebOS.state.load(); const saved = WebOS.state.state.windows || {};
      for(const id of Object.keys(saved)){
        const s = saved[id];
        const { el } = this.create({ id, title: s.meta.title||'Window', width: parseInt(s.rect.width), height: parseInt(s.rect.height) });
        el.style.left = s.rect.left; el.style.top = s.rect.top; el.style.zIndex = s.z;
        if(s.hidden) el.style.display='none';
      }
      // apply user prefs
      const accent = WebOS.state.state.prefs?.accentColor; if(accent) document.documentElement.style.setProperty('--accent', accent);
    }
  }

  WebOS.WindowManager = WindowManager;
})();
