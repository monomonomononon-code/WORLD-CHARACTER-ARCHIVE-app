/* ============ PROJECT (作品) ============ */
function getProject(id){ return projects.find(p=>p.id===id); }
function projectName(id){
  const p = getProject(id);
  return p ? (p.name || '(無題)') : '(未分類)';
}

// worlds/characters に作品未割り当てのものがあれば、既定の作品にまとめる。
// 既存データ移行・バックアップ復元（旧形式）の両方から呼ばれる。
async function ensureProjectAssignment(){
  const orphanWorlds = worlds.filter(w => !w.projectId);
  const orphanChars = characters.filter(c => !c.projectId);
  if(orphanWorlds.length === 0 && orphanChars.length === 0) return;

  let target = projects[0];
  if(!target){
    target = { id: crypto.randomUUID(), name: 'これまでのデータ' };
    projects.push(target);
    await saveData('projects', projects);
  }
  orphanWorlds.forEach(w => { w.projectId = target.id; });
  orphanChars.forEach(c => { c.projectId = target.id; });
  if(orphanWorlds.length) await saveData('worlds', worlds);
  if(orphanChars.length) await saveData('characters', characters);
}

function renderProjectPanel(){
  const el = document.getElementById('panel-project');
  el.innerHTML = `
    <div class="panel-toolbar">
      <span class="count">${projects.length}件の作品</span>
      <button class="btn" onclick="openProjectModal()">＋ 作品を追加</button>
    </div>
    ${projects.length === 0 ? `<div class="empty-hint">まだ作品がありません。「＋ 作品を追加」から登録してください。</div>` : `
      <div class="entity-grid">
        ${projects.map(p => `
          <div class="entity-card" onclick="enterProject('${p.id}')">
            <button class="del" onclick="event.stopPropagation(); deleteProject('${p.id}')">✕</button>
            <div class="name">${escapeHtml(p.name || '(無題)')}</div>
            <div class="meta">${worlds.filter(w=>w.projectId===p.id).length}件の世界観 ・ ${characters.filter(c=>c.projectId===p.id).length}人のキャラクター</div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

function openProjectModal(id){
  editingProjectId = id || null;
  const p = id ? getProject(id) : { name:'' };
  document.getElementById('project-modal-title').textContent = id ? '作品を編集' : '作品を追加';
  document.getElementById('p-name').value = p.name || '';
  document.getElementById('overlay-project').classList.add('open');
}
function closeProjectModal(){ document.getElementById('overlay-project').classList.remove('open'); }

async function saveProject(){
  const name = document.getElementById('p-name').value.trim();
  if(!name){ toast('作品名を入力してください'); return; }
  if(editingProjectId){
    const p = getProject(editingProjectId);
    p.name = name;
  }else{
    projects.push({ id: crypto.randomUUID(), name });
  }
  await saveData('projects', projects);
  closeProjectModal();
  if(currentProjectId) updateProjectBar();
  renderProjectPanel();
  toast('保存しました');
}

async function deleteProject(id){
  const p = getProject(id);
  if(!p) return;
  const wCount = worlds.filter(w=>w.projectId===id).length;
  const cCount = characters.filter(c=>c.projectId===id).length;
  if(wCount || cCount){
    const ok = confirm(`「${p.name}」には${wCount}件の世界観と${cCount}人のキャラクターが含まれています。作品を削除すると、これらもすべて削除されます。よろしいですか？`);
    if(!ok) return;
  }
  projects = projects.filter(x=>x.id!==id);
  worlds = worlds.filter(w=>w.projectId!==id);
  characters = characters.filter(c=>c.projectId!==id);
  await saveData('projects', projects);
  await saveData('worlds', worlds);
  await saveData('characters', characters);
  if(currentProjectId === id) exitProject();
  else renderProjectPanel();
}

/* ---- 作品への出入り ---- */
function enterProject(id){
  currentProjectId = id;
  openWorldId = null;
  openCharId = null;
  document.getElementById('panel-project').style.display = 'none';
  document.getElementById('project-bar').style.display = 'flex';
  document.getElementById('main-nav').style.display = 'flex';
  updateProjectBar();
  switchTab('world');
}
function exitProject(){
  currentProjectId = null;
  openWorldId = null;
  openCharId = null;
  document.getElementById('project-bar').style.display = 'none';
  document.getElementById('main-nav').style.display = 'none';
  document.getElementById('panel-world').style.display = 'none';
  document.getElementById('panel-char').style.display = 'none';
  document.getElementById('panel-project').style.display = 'block';
  renderProjectPanel();
}
function updateProjectBar(){
  document.getElementById('project-bar-name').textContent = projectName(currentProjectId);
}

/* ---- 世界観／キャラクターの編集モーダル内にある「作品」選択欄 ---- */
function projectOptionsHtml(selectedId){
  return projects.map(p => `<option value="${p.id}" ${p.id===selectedId?'selected':''}>${escapeHtml(p.name || '(無題)')}</option>`).join('');
}
