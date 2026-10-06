/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Capa de almacenamiento
   IndexedDB con fallback automático a localStorage + multi-workspace
   Autor: HDSystem IT · Tel: +54 9 11 4563-0851
   ========================================================================= */

const DBStorage = (() => {
  const DB_NAME = 'discografia_db_v1';
  const STORE = 'kv';

  /* v8.0.0: keys dinámicos según workspace */
  function getIdbKey(){
    try { return (typeof Workspaces !== 'undefined') ? Workspaces.idbKey() : 'main'; }
    catch(e){ return 'main'; }
  }
  function getLsKey(){
    try { return (typeof Workspaces !== 'undefined') ? Workspaces.lsKey() : 'discografia_db_v3'; }
    catch(e){ return 'discografia_db_v3'; }
  }

  const IDB_KEY = 'main';
  const LS_FALLBACK = 'discografia_db_v3';

  let _db = null;
  let _mode = 'unknown'; // 'idb' | 'ls'

  function _openDB(){
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => { _db = req.result; resolve(_db); };
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('IndexedDB bloqueada por otra pestaña'));
    });
  }

  function _idbGet(key){
    return _openDB().then(db => new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
  }

  function _idbSet(key, value){
    return _openDB().then(db => new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
      tx.onabort = () => rej(tx.error || new Error('aborted'));
    }));
  }

  function _idbDel(key){
    return _openDB().then(db => new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    }));
  }

  async function init(){
    try {
      if (typeof indexedDB === 'undefined'){ _mode = 'ls'; return _mode; }
      await _openDB();
      _mode = 'idb';

      /* Migración automática si la IDB del workspace está vacía pero hay datos en LS */
      const idbKey = getIdbKey();
      const lsKey = getLsKey();
      const existing = await _idbGet(idbKey);
      if (!existing){
        const fromLS = localStorage.getItem(lsKey) || localStorage.getItem(LS_FALLBACK);
        if (fromLS){
          try {
            const parsed = JSON.parse(fromLS);
            await _idbSet(idbKey, parsed);
            console.log(`%c[DBStorage] ✅ Migrado desde localStorage a IndexedDB (${idbKey})`, 'color:#5ddc9a;font-weight:bold');
          } catch(e){ console.warn('[DBStorage] JSON viejo inválido, se ignora', e); }
        }
      }
      return _mode;
    } catch(e){
      console.warn('[DBStorage] IndexedDB no disponible, usando localStorage:', e.message);
      _mode = 'ls';
      return _mode;
    }
  }

  async function load(){
    const idbKey = getIdbKey();
    const lsKey = getLsKey();
    if (_mode === 'idb'){
      try {
        const raw = await _idbGet(idbKey);
        if (raw) return raw;
        return null;
      } catch(e){ console.warn('[DBStorage] load IDB falló, fallback a LS', e); _mode = 'ls'; }
    }
    try {
      const raw = localStorage.getItem(lsKey) || localStorage.getItem(LS_FALLBACK);
      if (raw) return JSON.parse(raw);
    } catch(e){}
    return null;
  }

  async function persist(db){
    const idbKey = getIdbKey();
    const lsKey = getLsKey();
    if (_mode === 'idb'){
      try { await _idbSet(idbKey, db); return true; }
      catch(e){ console.warn('[DBStorage] persist IDB falló, intento LS', e); _mode = 'ls'; }
    }
    try {
      localStorage.setItem(lsKey, JSON.stringify(db));
      return true;
    } catch(e){
      if (typeof isQuotaError === 'function' && isQuotaError(e)){
        if (typeof freeLocalStorageCaches === 'function') freeLocalStorageCaches();
        try { localStorage.setItem(lsKey, JSON.stringify(db)); return true; }
        catch(e2){ console.error('[DBStorage] quota LS persistente', e2); return false; }
      }
      console.error('[DBStorage] persist LS falló', e);
      return false;
    }
  }

  async function remove(){
    const idbKey = getIdbKey();
    const lsKey = getLsKey();
    if (_mode === 'idb'){ try { await _idbDel(idbKey); } catch(e){} }
    try { localStorage.removeItem(lsKey); } catch(e){}
  }

  /* v8.0.0: migrar una key de IDB a otra (para workspaces) */
  async function migrateKey(fromKey, toKey){
    try {
      const data = await _idbGet(fromKey);
      if (data){
        const existing = await _idbGet(toKey);
        if (!existing){
          await _idbSet(toKey, data);
          console.log(`%c[DBStorage] ✓ Migrado IDB: ${fromKey} → ${toKey}`, 'color:#5ddc9a');
        }
      }
    } catch(e){ console.warn('[DBStorage] migrateKey:', e); }
  }

  /* v8.0.0: elimina una key específica de IndexedDB */
  async function removeKey(key){
    if (_mode === 'idb'){ try { await _idbDel(key); } catch(e){} }
  }

  async function estimate(){
    try {
      if (navigator.storage && navigator.storage.estimate){
        const e = await navigator.storage.estimate();
        return { usage: e.usage || 0, quota: e.quota || 0, mode: _mode };
      }
    } catch(e){}
    return { usage: 0, quota: 0, mode: _mode };
  }

  const getMode = () => _mode;

  return { init, load, persist, remove, estimate, getMode, migrateKey, removeKey };
})();

if (typeof window !== 'undefined') window.DBStorage = DBStorage;