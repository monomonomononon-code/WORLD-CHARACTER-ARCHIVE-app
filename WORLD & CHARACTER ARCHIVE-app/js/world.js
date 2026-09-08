/* ============ WORLD (世界観設定) ============ */
function worldsInProject(){ return worlds.filter(w => w.projectId === currentProjectId); }

function renderWorldPanel(){
  const el = document.getElementById('panel-world');
  if(openWorldId){
    const w = worlds.find(x=>x.id===openWorldId);
    if(!w){ openWorldId=null; return renderWorldPanel(); }
    el.innerHTML = `
      <button class="back-link" onclick="openWorldId=null; renderWorldPanel();">← 一覧に戻る</button>
      <div class="detail-head">
        <div>
          <h2 class="serif">${escapeHtml(w.title || '(無題)')}</h2>
        </div>
        <div class="detail-actions">
          <button class="btn small ghost" onclick="copyText(worldToText(getWorld('${w.id}')), '内容をコピーしました')">コピー</button>
          <button class="btn small ghost" onclick="openWorldModal('${w.id}')">編集</button>
        </div>
      </div>
      <div class="world-content">${escapeHtml(w.content || '（内容未入力）')}</div>
    `;
    return;
  }
  const list = worldsInProject();
  el.innerHTML = `
    <div class="panel-toolbar">
      <span class="count">${list.length}件の設定</span>
      <div style="display:flex; gap:8px;">
        ${list.length ? `<button class="btn ghost small" onclick="copyText(allWorldsToText(), '世界観をすべてコピーしました')">まとめてコピー</button>` : ''}
        <button class="btn" onclick="openWorldModal()">＋ 世界観を追加</button>
      </div>
    </div>
    ${list.length === 0 ? `<div class="empty-hint">まだ世界観設定がありません。「＋ 世界観を追加」から登録してください。</div>` : `
      <div class="entity-grid">
        ${list.map(w => `
          <div class="entity-card" onclick="openWorldId='${w.id}'; renderWorldPanel();">
            <button class="del" onclick="event.stopPropagation(); deleteWorld('${w.id}')">✕</button>
            <div class="name">${escapeHtml(w.title || '(無題)')}</div>
            <div class="meta">${escapeHtml((w.content||'').slice(0,40))}${(w.content||'').length>40?'…':''}</div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}
function getWorld(id){ return worlds.find(w=>w.id===id); }
function worldToText(w){
  return `■ ${w.title || '(無題)'}\n${w.content || ''}`;
}
function allWorldsToText(){
  return worldsInProject().map(worldToText).join('\n\n————————\n\n');
}

function openWorldModal(id){
  editingWorldId = id || null;
  const w = id ? getWorld(id) : { title:'', content:'', projectId: currentProjectId };
  document.getElementById('world-modal-title').textContent = id ? '世界観設定を編集' : '世界観設定を追加';
  document.getElementById('w-project').innerHTML = projectOptionsHtml(w.projectId);
  document.getElementById('w-title').value = w.title || '';
  document.getElementById('w-content').value = w.content || '';
  document.getElementById('overlay-world').classList.add('open');
}
function closeWorldModal(){ document.getElementById('overlay-world').classList.remove('open'); }
async function saveWorld(){
  const title = document.getElementById('w-title').value.trim();
  const content = document.getElementById('w-content').value.trim();
  const projectId = document.getElementById('w-project').value;
  if(!title && !content){ toast('タイトルか内容を入力してください'); return; }
  if(editingWorldId){
    const w = getWorld(editingWorldId);
    w.title = title; w.content = content; w.projectId = projectId;
  }else{
    worlds.push({ id: crypto.randomUUID(), projectId, title, content });
  }
  await saveData('worlds', worlds);
  closeWorldModal();
  renderWorldPanel();
  renderProjectPanel();
  toast('保存しました');
}
async function deleteWorld(id){
  worlds = worlds.filter(w=>w.id!==id);
  await saveData('worlds', worlds);
  if(openWorldId===id) openWorldId=null;
  renderWorldPanel();
  renderProjectPanel();
}
