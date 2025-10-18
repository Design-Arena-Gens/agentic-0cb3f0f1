(function(){
  const id='finder'; const title='Finder';
  function newWindow(path='/'){
    const { content } = WebOS.wm.create({ appId:id, title:'Finder', width:900, height:560 });
    content.innerHTML = `
      <div class="finder">
        <div class="sidebar">
          <div class="section">Favorites</div>
          <button data-path="/">All Files</button>
          <button data-path="/apps">Applications</button>
          <div class="section">Devices</div>
          <button data-path="/">Macintosh HD</button>
          <div class="section">Tags</div>
          <div class="tags"><span class="tag blue"></span><span class="tag green"></span><span class="tag orange"></span></div>
        </div>
        <div class="browser">
          <div class="toolbar">
            <button data-view="icons">▣</button>
            <button data-view="list">≣</button>
            <button data-view="columns">☰</button>
            <input id="search" placeholder="Search"/>
          </div>
          <div class="content" id="finder-content"></div>
        </div>
        <div class="preview" id="finder-preview"></div>
      </div>`;
    style();
    bind(content, path);
  }
  function style(){ if(document.getElementById('finder-style')) return; const s=document.createElement('style'); s.id='finder-style'; s.textContent=`
    .finder{display:grid;grid-template-columns:220px 1fr 320px;height:100%}
    .sidebar{background:rgba(255,255,255,.6);backdrop-filter:blur(16px);padding:10px;display:flex;flex-direction:column;gap:6px}
    .sidebar .section{font-weight:700;margin-top:6px;color:#6b7280}
    .sidebar button{border:0;background:transparent;padding:6px 8px;border-radius:8px;text-align:left}
    .sidebar button:hover{background:rgba(0,0,0,0.06)}
    .browser{display:flex;flex-direction:column}
    .toolbar{display:flex;gap:8px;align-items:center;padding:8px;border-bottom:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.5)}
    .toolbar input{flex:1;border:0;background:#f2f2f7;border-radius:8px;padding:6px 10px}
    .content{flex:1;overflow:auto;padding:12px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:16px}
    .grid .item{display:flex;flex-direction:column;align-items:center;gap:6px;border-radius:10px;padding:8px}
    .grid .item:hover{background:rgba(0,0,0,0.06)}
    .list{display:grid;grid-template-columns: 1fr 120px 120px; gap:8px}
    .columns{display:flex;gap:8px}
    .col{flex:1; min-width:150px; max-width: 300px; background:rgba(255,255,255,.6); border-radius:10px; padding:6px; overflow:auto}
    .preview{border-left:1px solid rgba(0,0,0,.06); background:rgba(255,255,255,.4)}
  `; document.head.appendChild(s);} 

  function bind(root, path){
    const content = root.querySelector('#finder-content'); const preview = root.querySelector('#finder-preview');
    let view='columns';
    function render(){
      if(view==='icons') renderIcons(path); else if(view==='list') renderList(path); else renderColumns(path);
    }
    function renderIcons(p){ const items = WebOS.vfs.list(p); content.className='content grid'; content.innerHTML = items.map(it=>`<div class='item' data-name='${it.name}' data-type='${it.type}'>
      <img src='images/icons/${it.type==='dir'?'folder':'file'}.svg' alt='${it.type}' width='48' height='48'/>
      <div>${it.name}</div>
    </div>`).join(''); }
    function renderList(p){ const items = WebOS.vfs.list(p); content.className='content list'; content.innerHTML = `<div>Name</div><div>Kind</div><div>Modified</div>` + items.map(it=>`<div>${it.name}</div><div>${it.type}</div><div>—</div>`).join(''); }
    function renderColumns(p){
      content.className='content columns'; content.innerHTML = '';
      const parts = p.split('/').filter(Boolean);
      const paths = ['/', ...parts.map((_,i)=> '/'+parts.slice(0,i+1).join('/'))];
      let currentPath = '';
      paths.forEach(pp=>{
        currentPath = pp; const items = WebOS.vfs.list(pp);
        const col = document.createElement('div'); col.className='col'; col.dataset.path = pp;
        col.innerHTML = items.map(it=>`<div class='row' data-name='${it.name}' data-type='${it.type}'>${it.name}</div>`).join('');
        col.addEventListener('click', (e)=>{
          const row = e.target.closest('.row'); if(!row) return; const next = (pp==='/'? '' : pp) + '/' + row.dataset.name; renderColumns(next);
          preview.innerHTML = `<div style='padding:12px'><h3>${row.dataset.name}</h3><div>Type: ${row.dataset.type}</div></div>`;
        });
        content.appendChild(col);
      });
    }

    root.querySelectorAll('.toolbar button').forEach(b=> b.addEventListener('click', ()=>{ view = b.dataset.view; render(); }));
    root.querySelectorAll('.sidebar button').forEach(b=> b.addEventListener('click', ()=>{ path = b.dataset.path; render(); }));

    WebOS.vfs.load().then(()=> render());
  }

  WebOS.apps.register({ id, title, open:newWindow, menus:[ { title:'File', items:[ { label:'New Window', action:()=> WebOS.bus.emit('finder:new-window') } ] } ] });
  WebOS.bus.on('finder:new-window', ()=> newWindow('/'));
  WebOS.bus.on('finder:go', (p)=> newWindow(p||'/'));
})();
