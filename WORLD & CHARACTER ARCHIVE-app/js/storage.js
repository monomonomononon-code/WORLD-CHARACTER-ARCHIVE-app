/* ============ storage helpers (localStorage) ============ */
const STORAGE_PREFIX = 'wca:';

async function loadData(key, fallback){
  try{
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  }catch(e){
    console.error('storage load failed', e);
    return fallback;
  }
}

async function saveData(key, value){
  try{
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  }catch(e){
    console.error('storage save failed', e);
  }
}
