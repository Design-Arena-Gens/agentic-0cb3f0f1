(function(){
  const id='notepad'; const title='TextEdit';
  function open(doc){
    const { content } = WebOS.wm.create({ appId:id, title: doc?.name || title, width:720, height:520 });
    content.innerHTML = `
      <div class="te-container">
        <div class="te-toolbar">
          <select id="te-font"></select>
          <select id="te-size">
            ${[12,14,16,18,24,32,48].map(s=>`<option>${s}</option>`).join('')}
          </select>
          <button id="te-bold"><b>B</b></button>
          <button id="te-italic"><i>I</i></button>
          <button id="te-underline"><u>U</u></button>
          <button id="te-align-left">⟸</button>
          <button id="te-align-center">⇔</button>
          <button id="te-align-right">⟹</button>
          <button id="te-open">Open…</button>
          <button id="te-save">Save…</button>
        </div>
        <div class="te-editor" id="te-editor" contenteditable spellcheck="false"></div>
      </div>`;
    style();
    populateFonts();
    bind(content);
  }
  function style(){
    if(document.getElementById('te-style')) return; const s=document.createElement('style'); s.id='te-style';
    s.textContent = `.te-container{height:100%;display:flex;flex-direction:column}
    .te-toolbar{display:flex;gap:8px;padding:8px;background:rgba(255,255,255,.6);backdrop-filter:blur(16px)}
    .te-toolbar select, .te-toolbar button{border:0;background:#f2f2f7;border-radius:8px;padding:6px 10px}
    .te-editor{flex:1;padding:16px;line-height:1.6;white-space:pre-wrap;outline:none}
    `; document.head.appendChild(s);
  }
  function populateFonts(){
    const fontSel = document.getElementById('te-font');
    const fonts = ['SF Pro Text','SF Mono','Helvetica Neue','Georgia','Times New Roman','Courier New'];
    fontSel.innerHTML = fonts.map(f=>`<option>${f}</option>`).join('');
  }
  function bind(root){
    const ed = root.querySelector('#te-editor'); const sizeSel=root.querySelector('#te-size'); const fontSel=root.querySelector('#te-font');
    root.querySelector('#te-bold').onclick=()=> document.execCommand('bold');
    root.querySelector('#te-italic').onclick=()=> document.execCommand('italic');
    root.querySelector('#te-underline').onclick=()=> document.execCommand('underline');
    root.querySelector('#te-align-left').onclick=()=> document.execCommand('justifyLeft');
    root.querySelector('#te-align-center').onclick=()=> document.execCommand('justifyCenter');
    root.querySelector('#te-align-right').onclick=()=> document.execCommand('justifyRight');
    sizeSel.onchange=()=> document.execCommand('fontSize', false, '7');
    sizeSel.addEventListener('change', ()=>{ ed.style.fontSize = sizeSel.value + 'px'; });
    fontSel.addEventListener('change', ()=>{ ed.style.fontFamily = fontSel.value; });

    root.querySelector('#te-open').onclick=()=> simulateOpen(ed);
    root.querySelector('#te-save').onclick=()=> simulateSave(ed);
  }
  function simulateOpen(ed){
    const dialog = createDialog('Open', listFiles('/'));
    document.getElementById('dialogs').appendChild(dialog);
    dialog.querySelectorAll('.file-item').forEach(it=> it.addEventListener('click', ()=>{ ed.textContent = `Opened ${it.dataset.path}`; dialog.remove(); }));
  }
  function simulateSave(ed){
    const dialog = createDialog('Save', `<label>Filename</label><input id='save-name' value='Untitled.txt'/><button id='save-ok'>Save</button>`);
    document.getElementById('dialogs').appendChild(dialog);
    dialog.querySelector('#save-ok').addEventListener('click', ()=>{ const name = dialog.querySelector('#save-name').value; ed.dataset.name = name; dialog.remove(); });
  }
  function listFiles(path){
    const items = WebOS.vfs.get().children || [];
    return `<div class='dialog-list'>${items.map(c=>`<div class='file-item' data-path='/${c.name}'>${c.name}</div>`).join('')}</div>`;
  }
  function createDialog(title, content){
    const shell = document.createElement('div'); shell.className='dialog-modal'; shell.innerHTML = `<div class='dialog-window'><div class='dialog-title'>${title}</div><div class='dialog-content'>${content}</div></div>`;
    Object.assign(shell.style,{position:'fixed',inset:'0',display:'grid',placeItems:'center',backdropFilter:'blur(16px)',background:'rgba(0,0,0,.2)',zIndex:9999});
    const dw = shell.querySelector('.dialog-window'); Object.assign(dw.style,{width:'480px',background:'rgba(255,255,255,.9)',borderRadius:'14px',boxShadow:'var(--win-shadow)'});
    const dt = shell.querySelector('.dialog-title'); Object.assign(dt.style,{padding:'12px 16px',borderBottom:'1px solid rgba(0,0,0,.08)',fontWeight:'600'});
    const dc = shell.querySelector('.dialog-content'); Object.assign(dc.style,{padding:'12px 16px'});
    shell.addEventListener('click', (e)=>{ if(e.target===shell) shell.remove(); });
    return shell;
  }

  WebOS.apps.register({ id, title, open, menus:[ { title:'Format', items:[ { label:'Bold', action:()=> document.execCommand('bold') }, { label:'Italic', action:()=> document.execCommand('italic') } ] } ] });
  WebOS.bus.on('notepad:new', ()=> open());
})();
