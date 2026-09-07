/* ============ app entry point ============ */
function switchTab(tab){
  currentTab = tab;
  document.getElementById('tab-world').classList.toggle('active', tab==='world');
  document.getElementById('tab-char').classList.toggle('active', tab==='char');
  document.getElementById('panel-world').style.display = tab==='world' ? 'block':'none';
  document.getElementById('panel-char').style.display = tab==='char' ? 'block':'none';
}

(async function init(){
  worlds = await loadData('worlds', []);
  characters = await loadData('characters', []);
  renderWorldPanel();
  renderCharPanel();
})();
