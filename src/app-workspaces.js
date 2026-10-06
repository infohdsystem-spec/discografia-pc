/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Multi-colección (Workspaces)
   Autor: HDSystem IT · Tel: +54 9 11 4563-0851
   ========================================================================= */

const WORKSPACES_KEY = 'discografia_workspaces_v1';
const LEGACY_DB_KEY = 'discografia_db_v3';

const DEFAULT_WORKSPACE = {
  id: 'default',
  name: 'Mi colección',
  icon: '💿',
  color: '#4fc3f7',
  createdAt: null,
  updatedAt: null
};

const WORKSPACE_ICONS = ['💿','🎵','🎸','🎷','🎹','🥁','🎺','🎻','🎤','🎧','🎼','⭐','🔥','💫','🌟','📀','🎬','🏆','🌎','🚀'];
const WORKSPACE_COLORS = ['#4fc3f7','#a78bfa','#ffca28','#5ddc9a','#ff6b6b','#ffa94d','#f472b6','#34d399','#60a5fa','#fbbf24','#c084fc','#f87171'];

function workspaceSlugify(name){
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32) || ('ws_' + Date.now().toString(36));
}

function generateWorkspaceId(name, existing = []){
  const base = workspaceSlugify(name);
  const ids = new Set((existing || []).map(w => w.id));
  if (!ids.has(base)) return base;
  let i = 2;
  while (ids.has(base + '_' + i)) i++;
  return base + '_' + i;
}

function validateWorkspaceName(name, existing = [], currentId = null){
  const clean = String(name || '').trim();
  if (!clean) return { ok: false, error: 'name_empty' };
  if (clean.length > 40) return { ok: false, error: 'name_too_long' };
  const lower = clean.toLowerCase();
  const dup = (existing || []).find(w => w.id !== currentId && String(w.name || '').toLowerCase() === lower);
  if (dup) return { ok: false, error: 'name_duplicated' };
  return { ok: true };
}

function workspaceColorFromSeed(seed){
  const s = String(seed || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return WORKSPACE_COLORS[Math.abs(h) % WORKSPACE_COLORS.length];
}

function isSafeWorkspaceId(id){
  return typeof id === 'string' && /^[a-z0-9_]{1,40}$/.test(id);
}

const Workspaces = (() => {
  let _state = { currentId: DEFAULT_WORKSPACE.id, list: [] };
  let _loaded = false;

  function _load(){
    try {
      const raw = localStorage.getItem(WORKSPACES_KEY);
      if (raw){
        const p = JSON.parse(raw);
        if (p && Array.isArray(p.list) && p.list.length > 0){
          _state.list = p.list.filter(w => w && isSafeWorkspaceId(w.id)).map(w => ({
            id: w.id,
            name: String(w.name || w.id).slice(0, 40),
            icon: String(w.icon || '💿').slice(0, 4),
            color: String(w.color || workspaceColorFromSeed(w.id)).slice(0, 12),
            createdAt: w.createdAt || null,
            updatedAt: w.updatedAt || null
          }));
          _state.currentId = (_state.list.find(w => w.id === p.currentId)) ? p.currentId : _state.list[0].id;
          _loaded = true;
          return;
        }
      }
    } catch(e){ console.warn('[Workspaces] load:', e); }
    _migrateFromLegacy();
    _loaded = true;
  }

  function _migrateFromLegacy(){
    const now = new Date().toISOString();
    const def = { ...DEFAULT_WORKSPACE, createdAt: now, updatedAt: now };
    _state.list = [def];
    _state.currentId = def.id;
    _persist();
    try {
      const legacyDB = localStorage.getItem(LEGACY_DB_KEY);
      const newKey = LEGACY_DB_KEY + ':' + def.id;
      const alreadyMigrated = localStorage.getItem(newKey);
      if (legacyDB && !alreadyMigrated){
        localStorage.setItem(newKey, legacyDB);
        console.log('%c[Workspaces] ✓ DB legacy migrada a workspace "default"', 'color:#5ddc9a;font-weight:bold');
      }
    } catch(e){ console.warn('[Workspaces] migración:', e); }
    _migrateIdbLegacy().catch(e => console.warn('[Workspaces] idb migración:', e));
  }

  async function _migrateIdbLegacy(){
    if (typeof DBStorage === 'undefined' || !DBStorage.migrateKey) return;
    try { await DBStorage.migrateKey('main', 'main:' + DEFAULT_WORKSPACE.id); }
    catch(e){ /* silencioso */ }
  }

  function _persist(){
    try { localStorage.setItem(WORKSPACES_KEY, JSON.stringify(_state)); }
    catch(e){ console.warn('[Workspaces] persist:', e); }
  }

  function _touch(id){
    const w = _state.list.find(x => x.id === id);
    if (w){ w.updatedAt = new Date().toISOString(); _persist(); }
  }

  function init(){
    if (!_loaded) _load();
    return { currentId: _state.currentId, list: _state.list.map(w => ({ ...w })) };
  }

  const getCurrentId = () => _state.currentId;
  const getCurrent = () => _state.list.find(w => w.id === _state.currentId) || null;
  const getAll = () => _state.list.map(w => ({ ...w }));
  const count = () => _state.list.length;

  function getById(id){
    const w = _state.list.find(x => x.id === id);
    return w ? { ...w } : null;
  }

  function create({ name, icon, color } = {}){
    const v = validateWorkspaceName(name, _state.list);
    if (!v.ok){
      const msgs = { name_empty: 'El nombre no puede estar vacío', name_too_long: 'El nombre es muy largo (máx 40)', name_duplicated: 'Ya existe una colección con ese nombre' };
      return { ok: false, error: msgs[v.error] || v.error };
    }
    const id = generateWorkspaceId(name, _state.list);
    const now = new Date().toISOString();
    const ws = {
      id,
      name: String(name).trim().slice(0, 40),
      icon: String(icon || WORKSPACE_ICONS[Math.floor(Math.random() * WORKSPACE_ICONS.length)]).slice(0, 4),
      color: String(color || workspaceColorFromSeed(id)).slice(0, 12),
      createdAt: now,
      updatedAt: now
    };
    _state.list.push(ws);
    _persist();
    return { ok: true, workspace: { ...ws } };
  }

  function rename(id, newName){
    const w = _state.list.find(x => x.id === id);
    if (!w) return { ok: false, error: 'not_found' };
    const v = validateWorkspaceName(newName, _state.list, id);
    if (!v.ok){
      const msgs = { name_empty: 'El nombre no puede estar vacío', name_too_long: 'El nombre es muy largo (máx 40)', name_duplicated: 'Ya existe una colección con ese nombre' };
      return { ok: false, error: msgs[v.error] || v.error };
    }
    w.name = String(newName).trim().slice(0, 40);
    w.updatedAt = new Date().toISOString();
    _persist();
    return { ok: true };
  }

  function setIcon(id, icon){
    const w = _state.list.find(x => x.id === id);
    if (!w) return false;
    w.icon = String(icon || '💿').slice(0, 4);
    w.updatedAt = new Date().toISOString();
    _persist();
    return true;
  }

  function setColor(id, color){
    const w = _state.list.find(x => x.id === id);
    if (!w) return false;
    w.color = String(color || workspaceColorFromSeed(id)).slice(0, 12);
    w.updatedAt = new Date().toISOString();
    _persist();
    return true;
  }

  async function setCurrent(id){
    if (!_state.list.find(w => w.id === id)) return false;
    if (_state.currentId === id) return true;
    try { if (typeof Store !== 'undefined' && Store.persist) Store.persist(); } catch(e){}
    _state.currentId = id;
    _persist();
    location.reload();
    return true;
  }

  async function remove(id){
    if (_state.list.length <= 1) return { ok: false, error: 'last_workspace' };
    const idx = _state.list.findIndex(w => w.id === id);
    if (idx === -1) return { ok: false, error: 'not_found' };
    _state.list.splice(idx, 1);
    const wasCurrent = _state.currentId === id;
    if (wasCurrent) _state.currentId = _state.list[0].id;
    _persist();
    try {
      localStorage.removeItem(LEGACY_DB_KEY + ':' + id);
      localStorage.removeItem(LEGACY_DB_KEY + '_BACKUP_migration_' + id);
    } catch(e){}
    try {
      if (typeof DBStorage !== 'undefined' && DBStorage.removeKey){
        await DBStorage.removeKey('main:' + id);
      }
    } catch(e){}
    if (wasCurrent){ location.reload(); return { ok: true, reloaded: true }; }
    return { ok: true };
  }

  function idbKey(id = _state.currentId){ return 'main:' + id; }
  function lsKey(id = _state.currentId){ return LEGACY_DB_KEY + ':' + id; }
  function touchCurrent(){ _touch(_state.currentId); }

  return {
    init,
    getCurrentId, getCurrent, getAll, getById, count,
    create, rename, setIcon, setColor,
    setCurrent, remove,
    idbKey, lsKey,
    touchCurrent,
    _slugify: workspaceSlugify,
    _generateId: generateWorkspaceId,
    _validate: validateWorkspaceName,
    _colorFromSeed: workspaceColorFromSeed,
    _isSafeId: isSafeWorkspaceId,
    ICONS: WORKSPACE_ICONS,
    COLORS: WORKSPACE_COLORS
  };
})();

if (typeof window !== 'undefined') window.Workspaces = Workspaces;