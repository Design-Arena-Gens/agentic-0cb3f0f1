(function(){
  const id='terminal'; const title='Terminal';
  const username='user'; const hostname='webos';
  function open(){
    const { content } = WebOS.wm.create({ appId:id, title, width:800, height:480 });
    content.innerHTML = `<div class='term'>
      <div class='screen' id='term-screen'></div>
      <input id='term-input' class='term-input' autocomplete='off'/>
    </div>`;
    style(); bind(content);
  }
  function style(){ if(document.getElementById('term-style')) return; const s=document.createElement('style'); s.id='term-style'; s.textContent=`
    .term{height:100%;display:grid;grid-template-rows:1fr auto;background:rgba(28,28,30,.85);color:#e5e5ea;font-family:Menlo, Monaco, 'SF Mono', monospace}
    .screen{padding:12px;overflow:auto;white-space:pre-wrap}
    .term-input{border:0;outline:none;background:rgba(0,0,0,0.2);color:#fff;padding:10px 12px;font-family:inherit}
    .prompt{color:#34c759}
  `; document.head.appendChild(s); }
  function bind(root){
    const screen = root.querySelector('#term-screen'); const input = root.querySelector('#term-input');
    const prompt = ()=> `${username}@${hostname} % `;
    function print(line){ const div=document.createElement('div'); div.textContent=line; screen.appendChild(div); screen.scrollTop = screen.scrollHeight; }
    function run(cmd){
      const [bin, ...args] = cmd.trim().split(/\s+/);
      switch(bin){
        case 'help': print('Commands: help, echo, date, clear, ls, pwd, whoami'); break;
        case 'echo': print(args.join(' ')); break;
        case 'date': print(new Date().toString()); break;
        case 'clear': screen.innerHTML=''; break;
        case 'pwd': print('/'); break;
        case 'whoami': print(username); break;
        case 'ls':
          const items = WebOS.vfs.get().children||[]; print(items.map(i=> i.name).join('  ')); break;
        default: if(bin) print(`zsh: command not found: ${bin}`);
      }
    }
    print('Welcome to macOS WebOS Terminal. Type `help`.');
    print(prompt());
    input.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'){
        const c = input.value; input.value=''; print(`${prompt()}${c}`); run(c); print(prompt());
      }
    });
  }

  WebOS.apps.register({ id, title, open });
  WebOS.bus.on('terminal:open', open);
})();
