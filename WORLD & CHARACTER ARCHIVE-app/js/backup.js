/* ============ backup / import・export ============ */
const BACKUP_APP_ID = 'world-character-archive';

function openBackupModal(){
  document.getElementById('backup-file-input').value = '';
  document.getElementById('backup-paste-input').value = '';
  document.getElementById('overlay-backup').classList.add('open');
}
function closeBackupModal(){
  document.getElementById('overlay-backup').classList.remove('open');
}

function buildBackupPayload(){
  return {
    app: BACKUP_APP_ID,
    version: 1,
    exportedAt: new Date().toISOString(),
    worlds,
    characters,
  };
}

function backupFileName(){
  return `character-archive-backup-${new Date().toISOString().slice(0,10)}.json`;
}

function exportBackupFile(){
  try{
    const json = JSON.stringify(buildBackupPayload(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // すぐにrevokeするとダウンロードが開始する前にURLが無効になるブラウザがあるため少し待つ
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('バックアップファイルをダウンロードしました');
  }catch(e){
    console.error('export failed', e);
    toast('ダウンロードに失敗しました。「JSONをコピー」をお試しください');
  }
}

// iOS Safari など <a download> が効かない環境向けの共有シート経由の保存
async function shareBackupFile(){
  try{
    const json = JSON.stringify(buildBackupPayload(), null, 2);
    const file = new File([json], backupFileName(), { type: 'application/json' });
    await navigator.share({ files: [file], title: backupFileName() });
  }catch(e){
    if(e && e.name === 'AbortError') return; // ユーザーがキャンセルした場合は何もしない
    console.error('share failed', e);
    toast('共有に失敗しました。「JSONをコピー」をお試しください');
  }
}

function copyBackupText(){
  const json = JSON.stringify(buildBackupPayload());
  copyText(json, 'JSONをコピーしました');
}

// ファイル共有に対応した環境でのみ「共有して保存」ボタンを表示する
(function initShareButtonVisibility(){
  const shareBtn = document.getElementById('btn-share-backup');
  if(!shareBtn) return;
  try{
    if(navigator.canShare && window.File){
      const testFile = new File(['test'], 'test.json', { type:'application/json' });
      if(navigator.canShare({ files: [testFile] })){
        shareBtn.hidden = false;
      }
    }
  }catch(e){ /* 非対応環境では表示しない */ }
})();

function importBackupFromFile(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => applyBackupJson(reader.result);
  reader.onerror = () => toast('ファイルの読み込みに失敗しました');
  reader.readAsText(file);
}

function importBackupFromPaste(){
  const text = document.getElementById('backup-paste-input').value.trim();
  if(!text){ toast('JSONを貼り付けてください'); return; }
  applyBackupJson(text);
}

async function applyBackupJson(text){
  let data;
  try{
    data = JSON.parse(text);
  }catch(e){
    toast('JSONの形式が正しくありません');
    return;
  }
  if(!data || !Array.isArray(data.worlds) || !Array.isArray(data.characters)){
    toast('バックアップデータの形式が正しくありません');
    return;
  }

  const hasExisting = worlds.length > 0 || characters.length > 0;
  const overwrite = hasExisting
    ? confirm('現在のデータを、読み込んだバックアップの内容で上書きします。よろしいですか？\n（キャンセルすると、重複しない項目だけを追加します）')
    : true;

  if(overwrite){
    worlds = data.worlds;
    characters = data.characters;
  }else{
    const existingWorldIds = new Set(worlds.map(w => w.id));
    data.worlds.forEach(w => { if(!existingWorldIds.has(w.id)) worlds.push(w); });
    const existingCharIds = new Set(characters.map(c => c.id));
    data.characters.forEach(c => { if(!existingCharIds.has(c.id)) characters.push(c); });
  }

  await saveData('worlds', worlds);
  await saveData('characters', characters);
  openWorldId = null;
  openCharId = null;
  renderWorldPanel();
  renderCharPanel();
  closeBackupModal();
  toast(overwrite ? 'バックアップを読み込みました' : '重複しない項目を追加しました');
}
