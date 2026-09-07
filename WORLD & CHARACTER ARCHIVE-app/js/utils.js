/* ============ shared utilities ============ */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.remove('show'), 1600);
}

async function copyText(text, msg){
  // まずClipboard APIを試す
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      toast(msg || 'コピーしました');
      return;
    }
  }catch(e){ /* フォールバックへ */ }

  // フォールバック：非表示のtextareaを使ったコピー
  try{
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.left = '-1000px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if(ok){
      toast(msg || 'コピーしました');
    }else{
      throw new Error('execCommand failed');
    }
  }catch(e){
    toast('コピーできませんでした。手動で選択してコピーしてください');
  }
}
