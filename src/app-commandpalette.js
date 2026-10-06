/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Command Palette (Ctrl+Shift+K)
   Autor: HDSystem IT
   ========================================================================= */

const CommandPalette = (() => {
  let _open = false;
  let _commands = [];
  let _filtered = [];
  let _selectedIdx = 0;
  let _overlay = null;
  let _input = null;
  let _listEl = null;
  let _recentIds = [];

  const RECENT_KEY = 'discografia_cmd_recent_v1';

  function loadRecent(){
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw){ const p = JSON.parse(raw); if (Array.isArray(p)) _recentIds = p.slice(0, 6); }
    } catch(e){ _recentIds = []; }
  }
  function saveRecent(id){
    _recentIds = [id, ..._recentIds.filter(x => x !== id)].slice(0, 6);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(_recentIds)); } catch(e){}
  }

  function registerCommands(){
    _commands = [
      { id: 'new-cd', icon: '➕', label: 'Nuevo CD', hint: 'Ctrl+N', run: () => abrirModal('nuevo') },
      { id: 'new-cat', icon: '📁', label: 'Nueva categoría', hint: 'Ctrl+K', run: () => abrirModalCategoria('crear') },
      { id: 'dashboard', icon: '📊', label: 'Panel de control', hint: 'Ctrl+D', run: () => setView(App.view === 'dashboard' ? 'table' : 'dashboard') },
      { id: 'grid', icon: '▦', label: 'Vista cuadrícula', hint: 'Ctrl+G', run: () => GridView.setEnabled(!GridView.isEnabled()) },
      { id: 'enrich', icon: '✨', label: 'Enriquecer colección', hint: 'Ctrl+E', run: () => BulkEnrich.open() },
      { id: 'labels', icon: '🏷️', label: 'Etiquetas imprimibles', hint: 'Ctrl+Shift+P', run: () => { if (typeof openLabelsForAll === 'function') openLabelsForAll(); } },
      { id: 'labels-sel', icon: '🏷️', label: 'Etiquetas de la selección', run: () => { if (typeof openLabelsForSelection === 'function') openLabelsForSelection(); } },
      { id: 'saved-filters', icon: '💾', label: 'Filtros guardados', run: () => { const b = document.getElementById('btnSavedFilters'); if (b) b.click(); } },
      { id: 'tags-mgr', icon: '🏷️', label: 'Gestionar etiquetas', run: () => { if (typeof Tags !== 'undefined') Tags.openManagerModal(); } },
      { id: 'duplicates', icon: '🔍', label: 'Buscar duplicados', hint: 'Ctrl+Shift+D', run: () => { Duplicates.render(); document.getElementById('duplicatesModal')?.classList.add('open'); } },
      { id: 'loans', icon: '📚', label: 'Ver préstamos', hint: 'Ctrl+Shift+L', run: () => { Loans.render(); document.getElementById('loansModal')?.classList.add('open'); } },
      { id: 'history', icon: '📜', label: 'Historial', hint: 'Ctrl+Shift+H', run: () => { HistoryLog.render(); document.getElementById('historyModal')?.classList.add('open'); } },
      { id: 'export-json', icon: '📤', label: 'Exportar backup JSON', hint: 'Ctrl+S', run: () => exportFullJSON() },
      { id: 'export-csv', icon: '📊', label: 'Exportar CSV', run: () => exportCatCSV() },
      { id: 'export-pdf', icon: '📄', label: 'Exportar PDF', run: () => exportCatPDF() },
      { id: 'toggle-theme', icon: '🎨', label: 'Cambiar tema', hint: 'Ctrl+Shift+T', run: () => ThemeManager.toggle() },
      { id: 'workspaces', icon: '📚', label: 'Cambiar colección', run: () => { const b = document.getElementById('wsSelectorBtn'); if (b) b.click(); } },
      { id: 'shortcuts', icon: '⌨️', label: 'Ver atajos de teclado', hint: 'F2', run: () => { if (typeof Shortcuts !== 'undefined') Shortcuts.openModal(); } },
      { id: 'language', icon: '🌎', label: 'Cambiar idioma', run: () => { const b = document.getElementById('btnMore'); if (b) b.click(); setTimeout(() => document.getElementById('langSelector')?.focus(), 100); } },
      { id: 'manual', icon: '❓', label: 'Manual de uso', hint: 'F1', run: () => document.getElementById('manualModal')?.classList.add('open') },
      { id: 'legal', icon: '⚖️', label: 'Aviso legal', run: () => openLegalModal() },
      { id: 'diag', icon: '🩺', label: 'Diagnóstico de red', run: () => openNetworkDiag() },
      { id: 'force-update', icon: '🔄', label: 'Buscar actualización', run: () => { if (typeof SWManager !== 'undefined') SWManager.forceCheck(); } },
      { id: 'clear-cache', icon: '🧹', label: 'Vaciar caché', run: () => { if (confirm('¿Vaciar caché?')){ MetadataCache.clear(); ResolvedLinks.clear(); Toast.show('🧹 Caché vaciada', 'ok', 2500); } } },
      { id: 'reset', icon: '🗑️', label: 'Vaciar base de datos', run: () => document.getElementById('btnReset')?.click() }
    ];
    for (const key of Store.catKeys()){
      const cat = Store.get(key);
      _commands.push({
        id: 'go-cat-' + key,
        icon: cat.icon || '📀',
        label: 'Ir a: ' + cat.label,
        hint: `${cat.cds.length} CDs`,
        run: () => { App.cat = key; App.artista = null; App.subcat = null; App.tagFilter = null; renderTabs(); renderAll(); }
      });
    }
    if (typeof SavedFilters !== 'undefined'){
      for (const p of SavedFilters.getAll()){
        _commands.push({
          id: 'apply-sf-' + p.id,
          icon: p.icon,
          label: 'Aplicar filtro: ' + p.name,
          hint: 'Filtro guardado',
          run: () => SavedFilters.applyPreset(p.id)
        });
      }
    }
  }

  function fuzzyScore(text, query){
    const t = String(text || '').toLowerCase();
    const q = String(query || '').toLowerCase().trim();
    if (!q) return 0;
    if (t === q) return 1000;
    if (t.startsWith(q)) return 500;
    if (t.includes(q)) return 250;
    let ti = 0, qi = 0, score = 0;
    while (ti < t.length && qi < q.length){
      if (t[ti] === q[qi]){ qi++; score += 1; }
      ti++;
    }
    if (qi === q.length) return score;
    return -1;
  }

  function search(query){
    const q = String(query || '').trim();
    if (!q){
      const recents = _recentIds.map(id => _commands.find(c => c.id === id)).filter(Boolean);
      const others = _commands.filter(c => !_recentIds.includes(c.id));
      return [...recents, ...others].slice(0, 40);
    }
    const scored = _commands.map(c => {
      const s1 = fuzzyScore(c.label, q);
      const s2 = fuzzyScore(c.id, q) * 0.5;
      const s = Math.max(s1, s2);
      return { c, s };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
    return scored.map(x => x.c).slice(0, 40);
  }

  function build(){
    if (_overlay) return;
    _overlay = document.createElement('div');
    _overlay.id = 'cmdPaletteOverlay';
    _overlay.className = 'cmd-palette-overlay';
    _overlay.innerHTML = `
      <div class="cmd-palette" role="dialog" aria-modal="true">
        <div class="cmd-palette-head">
          <span class="cmd-palette-icon">⌘</span>
          <input type="text" id="cmdPaletteInput" placeholder="Escribí un comando… (ej: nuevo, dashboard, exportar)" autocomplete="off" spellcheck="false">
          <span class="cmd-palette-hint">Esc para cerrar</span>
        </div>
        <div class="cmd-palette-list" id="cmdPaletteList"></div>
        <div class="cmd-palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar · <kbd>Enter</kbd> ejecutar</span>
          <span id="cmdPaletteCount"></span>
        </div>
      </div>
    `;
    document.body.appendChild(_overlay);
    _input = _overlay.querySelector('#cmdPaletteInput');
    _listEl = _overlay.querySelector('#cmdPaletteList');

    _overlay.addEventListener('click', (e) => {
      if (e.target === _overlay) close();
    });
    _input.addEventListener('input', () => renderResults(_input.value));
    _input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown'){ e.preventDefault(); moveSelection(1); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); moveSelection(-1); }
      else if (e.key === 'Enter'){ e.preventDefault(); runSelected(); }
      else if (e.key === 'Escape'){ e.preventDefault(); close(); }
    });
  }

  function renderResults(query){
    _filtered = search(query);
    _selectedIdx = 0;
    const el = _listEl;
    if (!_filtered.length){
      el.innerHTML = `<div class="cmd-empty">Sin resultados para "${esc(query)}"</div>`;
      const cnt = document.getElementById('cmdPaletteCount'); if (cnt) cnt.textContent = '';
      return;
    }
    el.innerHTML = _filtered.map((c, i) => `
      <div class="cmd-item${i === _selectedIdx ? ' active' : ''}" data-cmd-idx="${i}">
        <span class="cmd-item-icon">${esc(c.icon)}</span>
        <span class="cmd-item-label">${esc(c.label)}</span>
        ${c.hint ? `<span class="cmd-item-hint">${esc(c.hint)}</span>` : ''}
      </div>
    `).join('');
    el.querySelectorAll('[data-cmd-idx]').forEach(item => {
      item.addEventListener('click', () => {
        _selectedIdx = parseInt(item.dataset.cmdIdx, 10) || 0;
        runSelected();
      });
    });
    const cnt = document.getElementById('cmdPaletteCount');
    if (cnt) cnt.textContent = `${_filtered.length} comando${_filtered.length === 1 ? '' : 's'}`;
    scrollToSelected();
  }

  function moveSelection(dir){
    if (!_filtered.length) return;
    _selectedIdx = Math.max(0, Math.min(_filtered.length - 1, _selectedIdx + dir));
    _listEl.querySelectorAll('.cmd-item').forEach((el, i) => el.classList.toggle('active', i === _selectedIdx));
    scrollToSelected();
  }

  function scrollToSelected(){
    const active = _listEl.querySelector('.cmd-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function runSelected(){
    const cmd = _filtered[_selectedIdx];
    if (!cmd) return;
    saveRecent(cmd.id);
    close();
    try { setTimeout(() => cmd.run(), 50); }
    catch(e){ Toast.show('⚠️ Error: ' + e.message, 'err', 4000); }
  }

  function open(){
    if (_open) return;
    registerCommands();
    build();
    _open = true;
    _overlay.classList.add('open');
    _input.value = '';
    renderResults('');
    setTimeout(() => _input.focus(), 40);
  }

  function close(){
    if (!_open) return;
    _open = false;
    _overlay.classList.remove('open');
  }

  const isOpen = () => _open;

  function init(){ loadRecent(); }

  return { init, open, close, isOpen, registerCommands, search, _fuzzyScore: fuzzyScore };
})();

if (typeof window !== 'undefined') window.CommandPalette = CommandPalette;