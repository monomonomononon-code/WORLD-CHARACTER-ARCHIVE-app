/* ============ CHARACTER (キャラクター) ============ */
function renderCharPanel(){
  const el = document.getElementById('panel-char');
  if(openCharId){
    const c = characters.find(x=>x.id===openCharId);
    if(!c){ openCharId=null; return renderCharPanel(); }
    el.innerHTML = renderCharDetail(c);
    return;
  }
  el.innerHTML = `
    <div class="panel-toolbar">
      <span class="count">${characters.length}人のキャラクター</span>
      <div style="display:flex; gap:8px;">
        ${characters.length ? `<button class="btn ghost small" onclick="copyText(allCharsToText(), 'キャラクターを全員コピーしました')">全員コピー</button>` : ''}
        <button class="btn" onclick="openCharModal()">＋ キャラクターを追加</button>
      </div>
    </div>
    ${characters.length === 0 ? `<div class="empty-hint">まだキャラクターがいません。「＋ キャラクターを追加」から登録してください。</div>` : `
      <div class="entity-grid">
        ${characters.map(c => `
          <div class="entity-card" onclick="openCharId='${c.id}'; renderCharPanel();">
            <button class="del" onclick="event.stopPropagation(); deleteChar('${c.id}')">✕</button>
            <div class="name">${escapeHtml(nameLabel(c))}</div>
            <div class="meta">${[c.affiliation, c.typeName].filter(Boolean).map(escapeHtml).join(' ・ ') || '&nbsp;'}</div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

function renderCharDetail(c){
  let missing = [];
  const boxesHtml = CHAR_BOXES.map(box => {
    const rows = box.fields.map(([key,label]) => {
      const val = (c[key]||'').trim();
      if(!val){ missing.push(label); return null; }
      return `<div class="field-row"><div class="label">${label}</div><div class="value">${escapeHtml(val)}</div></div>`;
    }).filter(Boolean);
    if(rows.length===0) return '';
    return `
      <div class="box">
        <div class="box-head">
          <h3>${box.title}</h3>
          <button class="btn small ghost" onclick="copyText(boxToText(getChar('${c.id}'), '${box.title}'), '${box.title}をコピーしました')">コピー</button>
        </div>
        ${rows.join('')}
      </div>
    `;
  }).join('');

  const rels = c.relationships || [];
  let relHtml = '';
  if(rels.length){
    relHtml = `
      <div class="box">
        <div class="box-head">
          <h3>人間関係</h3>
          <button class="btn small ghost" onclick="copyText(relToText(getChar('${c.id}')), '人間関係をコピーしました')">コピー</button>
        </div>
        ${rels.map(r=>`<div class="rel-item"><span class="rel-name">${escapeHtml(r.name)}</span><span class="rel-type">（${escapeHtml(r.relation)}）</span></div>`).join('')}
      </div>
    `;
  } else {
    missing.push('人間関係');
  }

  return `
    <button class="back-link" onclick="openCharId=null; renderCharPanel();">← 一覧に戻る</button>
    <div class="detail-head">
      <div>
        <h2 class="serif">${escapeHtml(nameLabel(c))}</h2>
        <div class="sub">${[c.affiliation, c.typeName].filter(Boolean).map(escapeHtml).join(' ・ ')}</div>
      </div>
      <div class="detail-actions">
        <button class="btn small ghost" onclick="copyText(charToText(getChar('${c.id}')), '全項目をコピーしました')">全部コピー</button>
        <button class="btn small ghost" onclick="openCharModal('${c.id}')">編集</button>
      </div>
    </div>
    ${boxesHtml}
    ${relHtml}
    ${missing.length ? `<div class="missing-block"><b>未入力：</b>${missing.join('　/　')}</div>` : ''}
  `;
}

function getChar(id){ return characters.find(c=>c.id===id); }
function nameLabel(c){
  const n = c.name || '(名称未設定)';
  return c.furigana ? `${n}（${c.furigana}）` : n;
}

function boxToText(c, boxTitle){
  const box = CHAR_BOXES.find(b=>b.title===boxTitle);
  const lines = box.fields
    .map(([key,label]) => { const v=(c[key]||'').trim(); return v ? `${label}：${v}` : null; })
    .filter(Boolean);
  return `【${boxTitle}】\n${lines.join('\n')}`;
}
function relToText(c){
  const rels = c.relationships || [];
  return `【人間関係】\n${rels.map(r=>`${r.name}：${r.relation}`).join('\n')}`;
}
function charToText(c){
  const parts = [];
  parts.push(`◆ ${nameLabel(c)}`);
  CHAR_BOXES.forEach(box=>{
    const lines = box.fields
      .map(([key,label]) => { const v=(c[key]||'').trim(); return v ? `${label}：${v}` : null; })
      .filter(Boolean);
    if(lines.length) parts.push(`【${box.title}】\n${lines.join('\n')}`);
  });
  if((c.relationships||[]).length){
    parts.push(`【人間関係】\n${c.relationships.map(r=>`${r.name}：${r.relation}`).join('\n')}`);
  }
  return parts.join('\n\n');
}
function allCharsToText(){
  return characters.map(charToText).join('\n\n════════════════\n\n');
}

/* ---- character modal ---- */
function openCharModal(id){
  editingCharId = id || null;
  const c = id ? getChar(id) : emptyChar();
  relDraft = JSON.parse(JSON.stringify(c.relationships || []));
  document.getElementById('char-modal-title').textContent = id ? 'キャラクターを編集' : 'キャラクターを追加';

  const grid = document.getElementById('char-form-grid');
  let html = '';
  CHAR_BOXES.forEach((box, bi) => {
    html += `<div class="form-section-title${bi===0?' first':''}">${box.title}</div>`;
    box.fields.forEach(([key,label,type]) => {
      const val = escapeHtml(c[key]||'');
      html += `
        <div class="form-field${type==='textarea' ? ' full':''}">
          <label>${label}</label>
          ${type==='textarea'
            ? `<textarea id="f-${key}" rows="2">${val}</textarea>`
            : `<input type="text" id="f-${key}" value="${val}">`}
        </div>`;
    });
  });
  html += `<div class="form-section-title">人間関係</div>`;
  html += `<div class="rel-editor" id="rel-editor"></div>`;
  grid.innerHTML = html;
  renderRelEditor();
  document.getElementById('overlay-char').classList.add('open');
}

function renderRelEditor(){
  const el = document.getElementById('rel-editor');
  el.innerHTML = `
    ${relDraft.map((r,i)=>`
      <div class="rel-editor-row">
        <input type="text" placeholder="人物名" value="${escapeHtml(r.name)}" onchange="relDraft[${i}].name=this.value">
        <input type="text" placeholder="関係性（例：親友）" value="${escapeHtml(r.relation)}" onchange="relDraft[${i}].relation=this.value">
        <button onclick="relDraft.splice(${i},1); renderRelEditor();">✕</button>
      </div>
    `).join('')}
    <div class="rel-add-row">
      <input type="text" id="rel-new-name" placeholder="人物名">
      <input type="text" id="rel-new-relation" placeholder="関係性（例：親友）">
      <button class="btn small ghost" style="border-radius:3px;" onclick="addRelDraft()">＋ 追加</button>
    </div>
  `;
}
function addRelDraft(){
  const n = document.getElementById('rel-new-name').value.trim();
  const r = document.getElementById('rel-new-relation').value.trim();
  if(!n && !r) return;
  relDraft.push({ name:n, relation:r });
  renderRelEditor();
}

function closeCharModal(){ document.getElementById('overlay-char').classList.remove('open'); }

async function saveChar(){
  const data = editingCharId ? getChar(editingCharId) : emptyChar();
  CHAR_BOXES.forEach(box => box.fields.forEach(([key]) => {
    const field = document.getElementById(`f-${key}`);
    if(field) data[key] = field.value.trim();
  }));
  data.relationships = relDraft.filter(r => r.name.trim() || r.relation.trim());

  if(!editingCharId){
    characters.push(data);
  }
  await saveData('characters', characters);
  closeCharModal();
  renderCharPanel();
  toast('保存しました');
}
async function deleteChar(id){
  characters = characters.filter(c=>c.id!==id);
  await saveData('characters', characters);
  if(openCharId===id) openCharId=null;
  renderCharPanel();
}
