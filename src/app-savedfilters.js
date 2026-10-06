/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Filtros guardados
   Autor: HDSystem IT
   ========================================================================= */

const SavedFilters = (() => {
  const STORAGE_KEY = 'discografia_saved_filters_v1';
  const MAX = 30;
  let _items = [];

  const QUICK_ICONS = ['⭐','🔥','📌','🎯','💎','🏆','📚','🎵','🎸','🌟','💫','✨','🧡','💙','💚'];

  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw){
        const p = JSON.parse(raw);
        if (Array.isArray(p)) _items = p.filter(x => x && x.id && x.name);
      }
    } catch(e){ _items = []; }
  }
  function persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_items)); } catch(e){}
  }
  const getAll = () => _items.map(x => ({ ...x, filters: { ...(x.filters || {}) } }));
  const count = () => _items.length;

  function normalizePreset(obj){
    if (!obj || typeof obj !== 'object') return null;
    const name = String(obj.name || '').trim().slice(0, 40);
    if (!name) return null;
    return {
      id: obj.id || ('sf_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)),
      name,
      icon: String(obj.icon || '⭐').slice(0, 4),
      createdAt: obj.createdAt || new Date().toISOString(),
      filters: {
        q: String(obj.filters?.q || '').slice(0, 200),
        artista: String(obj.filters?.artista || '').slice(0, 120),
        subcat: String(obj.filters?.subcat || '').slice(0, 40),
        tagFilter: String(obj.filters?.tagFilter || '').slice(0, 30),
        cat: String(obj.filters?.cat || '').slice(0, 40),
        sortKey: String(obj.filters?.sortKey || 'nro').slice(0, 20),
        sortDir: (obj.filters?.sortDir === -1) ? -1 : 1,
        view: (obj.filters?.view === 'dashboard') ? 'dashboard' : 'table',
        estado: String(obj.filters?.estado || ''),
        formato: String(obj.filters?.formato || ''),
        anioDesde: String(obj.filters?.anioDesde || ''),
        anioHasta: String(obj.filters?.anioHasta || ''),
        ubicacion: String(obj.filters?.ubicacion || ''),
        portada: String(obj.filters?.portada || ''),
        prestamo: String(obj.filters?.prestamo || '')
      }
    };
  }

  function hasActiveFilters(app){
    if (!app) return false;
    if (app.q && app.q.trim()) return true;
    if (app.artista) return true;
    if (app.subcat) return true;
    if (app.tagFilter) return true;
    if (app.filters){
      for (const k in app.filters) if (app.filters[k]) return true;
    }
    return false;
  }

  function savePreset({ name, icon } = {}){
    const preset = normalizePreset({
      name,
      icon: icon || QUICK_ICONS[Math.floor(Math.random() * QUICK_ICONS.length)],
      filters: {
        q: App.q || '',
        artista: App.artista || '',
        subcat: App.subcat || '',
        tagFilter: App.tagFilter || '',
        cat: (App.cat && App.cat !== ALL_CATS) ? App.cat : '',
        sortKey: App.sortKey,
        sortDir: App.sortDir,
        view: App.view,
        estado: App.filters?.estado || '',
        formato: App.filters?.formato || '',
        anioDesde: App.filters?.anioDesde || '',
        anioHasta: App.filters?.anioHasta || '',
        ubicacion: App.filters?.ubicacion || '',
        portada: App.filters?.portada || '',
        prestamo: App.filters?.prestamo || ''
      }
    });
    if (!preset) return { ok: false, error: 'name_required' };
    if (_items.length >= MAX) return { ok: false, error: 'max_reached' };
    const idx = _items.findIndex(x => x.name.toLowerCase() === preset.name.toLowerCase());
    if (idx !== -1) _items[idx] = preset;
    else _items.push(preset);
    persist();
    return { ok: true, preset: { ...preset, filters: { ...preset.filters } } };
  }

  function removePreset(id){
    const before = _items.length;
    _items = _items.filter(x => x.id !== id);
    if (_items.length < before){ persist(); return true; }
    return false;
  }

  function renamePreset(id, newName){
    const p = _items.find(x => x.id === id);
    if (!p) return false;
    const n = String(newName || '').trim().slice(0, 40);
    if (!n) return false;
    p.name = n;
    persist();
    return true;
  }

  function setIcon(id, icon){
    const p = _items.find(x => x.id === id);
    if (!p) return false;
    p.icon = String(icon || '⭐').slice(0, 4);
    persist();
    return true;
  }

  function applyPreset(id){
    const p = _items.find(x => x.id === id);
    if (!p) return false;
    const f = p.filters;
    App.q = f.q || '';
    App.artista = f.artista || null;
    App.subcat = f.subcat || null;
    App.tagFilter = f.tagFilter || null;
    if (f.cat && Store.get(f.cat)) App.cat = f.cat;
    else if (!f.cat) App.cat = ALL_CATS;
    App.sortKey = f.sortKey || 'nro';
    App.sortDir = (f.sortDir === -1) ? -1 : 1;
    App.view = f.view || 'table';
    App.filters = {
      estado: f.estado || '',
      formato: f.formato || '',
      anioDesde: f.anioDesde || '',
      anioHasta: f.anioHasta || '',
      ubicacion: f.ubicacion || '',
      portada: f.portada || '',
      prestamo: f.prestamo || ''
    };
    App.selected.clear();
    App.focusedKey = null;

    const q = document.getElementById('q');
    if (q) q.value = App.q;
    const sb = document.getElementById('searchBox');
    if (sb) sb.classList.toggle('has-value', !!App.q);
    const adv = document.getElementById('advModeBadge');
    if (adv) adv.style.display = (typeof AdvancedSearch !== 'undefined' && AdvancedSearch.isAdvanced(App.q)) ? '' : 'none';

    const map = { estado:'#fFiltroEstado', formato:'#fFiltroFormato', anioDesde:'#fFiltroAnioDesde', anioHasta:'#fFiltroAnioHasta', ubicacion:'#fFiltroUbicacion', portada:'#fFiltroPortada', prestamo:'#fFiltroPrestamo' };
    for (const k in map){
      const el = document.querySelector(map[k]);
      if (el) el.value = App.filters[k] || '';
    }
    if (typeof ensureValidCat === 'function') ensureValidCat();
    if (typeof renderTabs === 'function') renderTabs();
    if (typeof renderAll === 'function') renderAll();
    return true;
  }

  function openDropdown(anchor){
    let menu = document.getElementById('savedFiltersMenu');
    if (!menu){
      menu = document.createElement('div');
      menu.id = 'savedFiltersMenu';
      menu.className = 'saved-filters-menu';
      document.body.appendChild(menu);
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !e.target.closest('#btnSavedFilters')){
          menu.classList.remove('open');
        }
      });
    }
    render(menu);
    const r = anchor.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(window.innerWidth - 320, r.left - 240)) + 'px';
    menu.style.top = (r.bottom + 6) + 'px';
    menu.classList.add('open');
  }

  function render(menu){
    const items = getAll();
    const canSave = hasActiveFilters(App);
    menu.innerHTML = `
      <div class="saved-filters-head">
        <span>💾 Filtros guardados</span>
        <span class="sf-count">${items.length}/${MAX}</span>
      </div>
      <div class="saved-filters-list">
        ${items.length ? items.map(p => `
          <div class="sf-item" data-sf-id="${esc(p.id)}">
            <span class="sf-icon">${esc(p.icon)}</span>
            <span class="sf-name">${esc(p.name)}</span>
            <div class="sf-actions">
              <button type="button" class="sf-btn" data-sf-act="rename" title="Renombrar">✏️</button>
              <button type="button" class="sf-btn" data-sf-act="icon" title="Cambiar ícono">🎨</button>
              <button type="button" class="sf-btn danger" data-sf-act="delete" title="Eliminar">🗑️</button>
            </div>
          </div>
        `).join('') : `<div style="padding:20px 14px;text-align:center;color:var(--muted);font-size:.82rem">Sin filtros guardados</div>`}
      </div>
      <div class="saved-filters-foot">
        <button type="button" class="sf-save-btn" id="sfSaveCurrent" ${canSave ? '' : 'disabled title="Aplicá algún filtro primero"'}>
          💾 Guardar filtros actuales
        </button>
      </div>
    `;

    menu.querySelectorAll('.sf-item').forEach(el => {
      const id = el.dataset.sfId;
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-sf-act]')) return;
        menu.classList.remove('open');
        if (applyPreset(id)){
          const p = _items.find(x => x.id === id);
          Toast.show(`✨ Aplicado: ${p.icon} ${p.name}`, 'ok', 2500);
        }
      });
    });

    menu.querySelectorAll('[data-sf-act]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.sf-item').dataset.sfId;
        const p = _items.find(x => x.id === id);
        if (!p) return;
        const act = btn.dataset.sfAct;
        if (act === 'rename'){
          const nn = prompt(`Nuevo nombre para "${p.name}":`, p.name);
          if (nn === null) return;
          if (!renamePreset(id, nn)){ Toast.show('Nombre inválido', 'warn', 2500); return; }
          render(menu); Toast.show('✅ Renombrado', 'ok', 2000);
        } else if (act === 'icon'){
          pickIcon(id, (newIcon) => { setIcon(id, newIcon); render(menu); });
        } else if (act === 'delete'){
          if (!confirm(`¿Eliminar el filtro "${p.name}"?`)) return;
          removePreset(id);
          render(menu);
          Toast.show('🗑️ Filtro eliminado', 'warn', 2200);
        }
      });
    });

    const saveBtn = menu.querySelector('#sfSaveCurrent');
    if (saveBtn && canSave){
      saveBtn.addEventListener('click', () => {
        menu.classList.remove('open');
        showSaveDialog();
      });
    }
  }

  function pickIcon(id, cb){
    const p = _items.find(x => x.id === id);
    if (!p) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '460';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" style="max-width:420px">
        <div class="modal-head"><h3><span>🎨</span><span>Cambiar ícono</span></h3><button type="button" class="close" data-pick-x>✕</button></div>
        <div class="modal-body">
          <div class="sf-icon-grid">
            ${QUICK_ICONS.map(ic => `<button type="button" class="sf-icon-opt${ic === p.icon ? ' active' : ''}" data-ic="${esc(ic)}">${esc(ic)}</button>`).join('')}
          </div>
        </div>
        <div class="modal-foot"><div></div><div class="right"><button type="button" class="btn" data-pick-close>Cerrar</button></div></div>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('[data-pick-x]').addEventListener('click', close);
    overlay.querySelector('[data-pick-close]').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelectorAll('[data-ic]').forEach(b => {
      b.addEventListener('click', () => {
        const ic = b.dataset.ic;
        close();
        cb(ic);
        Toast.show('✅ Ícono actualizado', 'ok', 2000);
      });
    });
  }

  function showSaveDialog(){
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '460';
    const icon = QUICK_ICONS[Math.floor(Math.random() * QUICK_ICONS.length)];
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" style="max-width:440px">
        <div class="modal-head"><h3><span>💾</span><span>Guardar filtro</span></h3><button type="button" class="close" data-sv-x>✕</button></div>
        <div class="modal-body">
          <div class="field">
            <label for="sfNewName">Nombre *</label>
            <input type="text" id="sfNewName" maxlength="40" placeholder="Ej: Favoritos de rock, Para vender…" autocomplete="off">
          </div>
          <div class="field">
            <label>Ícono</label>
            <div class="sf-icon-grid" id="sfNewIconGrid">
              ${QUICK_ICONS.map(ic => `<button type="button" class="sf-icon-opt${ic === icon ? ' active' : ''}" data-ic="${esc(ic)}">${esc(ic)}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn" data-sv-cancel>Cancelar</button>
          <div class="right"><button type="button" class="btn primary" data-sv-ok>💾 Guardar</button></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    let selIcon = icon;
    const close = () => overlay.remove();
    overlay.querySelector('[data-sv-x]').addEventListener('click', close);
    overlay.querySelector('[data-sv-cancel]').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelectorAll('#sfNewIconGrid [data-ic]').forEach(b => {
      b.addEventListener('click', () => {
        selIcon = b.dataset.ic;
        overlay.querySelectorAll('#sfNewIconGrid .sf-icon-opt').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    const inp = overlay.querySelector('#sfNewName');
    setTimeout(() => inp.focus(), 80);
    const doSave = () => {
      const name = inp.value.trim();
      if (!name){ Toast.show('Ingresá un nombre', 'warn', 2500); inp.focus(); return; }
      const r = savePreset({ name, icon: selIcon });
      if (!r.ok){
        Toast.show('⚠️ ' + (r.error === 'max_reached' ? `Máximo ${MAX} filtros guardados` : r.error), 'warn', 3500);
        return;
      }
      close();
      Toast.show(`💾 Guardado: ${selIcon} ${name}`, 'ok', 2500);
    };
    overlay.querySelector('[data-sv-ok]').addEventListener('click', doSave);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); doSave(); } });
  }

  return {
    MAX,
    load, getAll, count,
    savePreset, removePreset, renamePreset, setIcon, applyPreset,
    openDropdown, hasActiveFilters,
    _normalizePreset: normalizePreset
  };
})();

if (typeof window !== 'undefined') window.SavedFilters = SavedFilters;