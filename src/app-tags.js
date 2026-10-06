/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Sistema de etiquetas (tags)
   Autor: HDSystem IT · Tel: +54 9 11 4563-0851
   ========================================================================= */

const Tags = (() => {
  const MAX_TAGS_PER_CD = 12;
  const MAX_TAG_LENGTH = 30;

  const COLORS = [
    '#4fc3f7','#a78bfa','#ffca28','#5ddc9a','#ff6b6b','#ffa94d',
    '#f472b6','#34d399','#60a5fa','#fbbf24','#c084fc','#f87171'
  ];

  function normalizeTag(t){
    return String(t || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s_-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, MAX_TAG_LENGTH);
  }

  function parseTags(str){
    if (!str) return [];
    return [...new Set(
      String(str).split(/[,\n]/).map(normalizeTag).filter(Boolean)
    )].slice(0, MAX_TAGS_PER_CD);
  }

  function colorForTag(tag){
    const s = String(tag || '');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return COLORS[Math.abs(h) % COLORS.length];
  }

  function getAllTags(){
    const set = new Set();
    for (const catKey of Store.catKeys()){
      for (const cd of Store.getCDs(catKey)){
        if (Array.isArray(cd.tags)) for (const t of cd.tags) set.add(t);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  }

  function getTagCounts(){
    const m = new Map();
    for (const catKey of Store.catKeys()){
      for (const cd of Store.getCDs(catKey)){
        if (Array.isArray(cd.tags)) for (const t of cd.tags) m.set(t, (m.get(t) || 0) + 1);
      }
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'));
  }

  function addTagToCD(cd, tag){
    if (!cd || !cd.id) return false;
    if (!Array.isArray(cd.tags)) cd.tags = [];
    const n = normalizeTag(tag);
    if (!n) return false;
    if (cd.tags.includes(n)) return false;
    if (cd.tags.length >= MAX_TAGS_PER_CD) return false;
    cd.tags.push(n);
    return true;
  }

  function removeTagFromCD(cd, tag){
    if (!cd || !Array.isArray(cd.tags)) return false;
    const n = normalizeTag(tag);
    const idx = cd.tags.indexOf(n);
    if (idx === -1) return false;
    cd.tags.splice(idx, 1);
    return true;
  }

  function setTagsOnCD(cd, arr){
    if (!cd) return [];
    const normalized = [...new Set((arr || []).map(normalizeTag).filter(Boolean))].slice(0, MAX_TAGS_PER_CD);
    cd.tags = normalized;
    return normalized;
  }

  function getTagsOfCD(cd){
    return Array.isArray(cd?.tags) ? [...cd.tags] : [];
  }

  function openManagerModal(){
    let modal = document.getElementById('tagsManagerModal');
    if (!modal){
      modal = buildManagerModal();
    }
    renderManagerBody(modal);
    modal.classList.add('open');
  }

  function closeManagerModal(){
    document.getElementById('tagsManagerModal')?.classList.remove('open');
  }

  function buildManagerModal(){
    const m = document.createElement('div');
    m.id = 'tagsManagerModal';
    m.className = 'modal-overlay';
    m.style.zIndex = '470';
    m.innerHTML = `
      <div class="modal wide" role="dialog" aria-modal="true" style="max-width:700px">
        <div class="modal-head">
          <h3><span>🏷️</span><span>Gestión de etiquetas</span></h3>
          <button type="button" class="close" id="tagsMgrClose">✕</button>
        </div>
        <div class="modal-body" id="tagsMgrBody"></div>
        <div class="modal-foot">
          <div style="font-size:.75rem;color:var(--muted)">
            💡 Las etiquetas se asignan por CD desde el modal de edición.
          </div>
          <div class="right">
            <button type="button" class="btn" id="tagsMgrCancel">Cerrar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    m.querySelector('#tagsMgrClose').addEventListener('click', closeManagerModal);
    m.querySelector('#tagsMgrCancel').addEventListener('click', closeManagerModal);
    m.addEventListener('click', e => { if (e.target === m) closeManagerModal(); });
    return m;
  }

  function renderManagerBody(modal){
    const body = modal.querySelector('#tagsMgrBody');
    const counts = getTagCounts();
    if (!counts.length){
      body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--muted)">
        📭 No hay etiquetas todavía.<br><br>
        Abrí un CD y agregá etiquetas desde el campo <b>🏷️ Etiquetas</b>.
      </div>`;
      return;
    }
    const total = counts.reduce((s, [, n]) => s + n, 0);
    body.innerHTML = `
      <div style="padding:12px 14px;background:rgba(167,139,250,.06);border-left:3px solid var(--purple);border-radius:8px;margin-bottom:14px;font-size:.85rem;line-height:1.5">
        <b>${counts.length}</b> etiquetas únicas · <b>${total}</b> asignaciones totales
      </div>
      <div class="tags-mgr-list">
        ${counts.map(([tag, n]) => {
          const color = colorForTag(tag);
          return `
            <div class="tags-mgr-row" data-tag="${esc(tag)}">
              <span class="tag-pill" style="--tag-color:${esc(color)}">${esc(tag)}</span>
              <span class="tags-mgr-count">${n}</span>
              <div class="tags-mgr-actions">
                <button type="button" class="btn" data-tag-act="filter" title="Filtrar por esta etiqueta">🔍</button>
                <button type="button" class="btn danger" data-tag-act="delete" title="Eliminar de todos los CDs">🗑️</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    body.querySelectorAll('[data-tag-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.closest('.tags-mgr-row').dataset.tag;
        const act = btn.dataset.tagAct;
        if (act === 'filter'){
          App.tagFilter = tag;
          closeManagerModal();
          renderAll();
          Toast.show(`🏷️ Filtrando por "${tag}"`, 'info', 2500);
        } else if (act === 'delete'){
          if (!confirm(`¿Eliminar la etiqueta "${tag}" de TODOS los CDs?`)) return;
          deleteTagFromAll(tag);
          renderManagerBody(modal);
          renderAll();
          Toast.show(`🗑️ Etiqueta "${tag}" eliminada`, 'warn', 3000);
        }
      });
    });
  }

  function deleteTagFromAll(tag){
    const n = normalizeTag(tag);
    let count = 0;
    for (const catKey of Store.catKeys()){
      for (const cd of Store.getCDs(catKey)){
        if (Array.isArray(cd.tags) && cd.tags.includes(n)){
          cd.tags = cd.tags.filter(t => t !== n);
          count++;
        }
      }
    }
    if (count > 0) Store.persist();
    if (App.tagFilter === n) App.tagFilter = null;
    return count;
  }

  function openFilterDropdown(anchor){
    let menu = document.getElementById('tagsFilterMenu');
    if (!menu){
      menu = document.createElement('div');
      menu.id = 'tagsFilterMenu';
      menu.className = 'tags-filter-menu';
      document.body.appendChild(menu);
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !e.target.closest('#btnTagsFilter')){
          menu.classList.remove('open');
        }
      });
    }
    renderFilterMenu(menu);
    const r = anchor.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(window.innerWidth - 280, r.left)) + 'px';
    menu.style.top = (r.bottom + 6) + 'px';
    menu.classList.add('open');
  }

  function renderFilterMenu(menu){
    const counts = getTagCounts();
    const current = App.tagFilter;
    const items = counts.length
      ? counts.map(([tag, n]) => {
          const color = colorForTag(tag);
          const active = tag === current;
          return `
            <button type="button" class="tags-filter-item${active ? ' active' : ''}" data-tag="${esc(tag)}">
              <span class="tag-pill" style="--tag-color:${esc(color)}">${esc(tag)}</span>
              <span class="tags-filter-count">${n}</span>
              ${active ? '<span style="color:var(--accent)">✓</span>' : ''}
            </button>
          `;
        }).join('')
      : `<div style="padding:16px;text-align:center;color:var(--muted);font-size:.82rem">Sin etiquetas</div>`;
    menu.innerHTML = `
      <div class="tags-filter-head">
        <span>🏷️ Filtrar por etiqueta</span>
        ${current ? `<button type="button" class="tags-filter-clear" data-tag-clear>✕ Limpiar</button>` : ''}
      </div>
      <div class="tags-filter-list">${items}</div>
      <div class="tags-filter-foot">
        <button type="button" class="tags-filter-manage" data-tag-manage>⚙️ Gestionar etiquetas</button>
      </div>
    `;
    menu.querySelectorAll('.tags-filter-item').forEach(b => {
      b.addEventListener('click', () => {
        const tag = b.dataset.tag;
        App.tagFilter = (App.tagFilter === tag) ? null : tag;
        menu.classList.remove('open');
        renderAll();
      });
    });
    menu.querySelector('[data-tag-clear]')?.addEventListener('click', () => {
      App.tagFilter = null;
      menu.classList.remove('open');
      renderAll();
    });
    menu.querySelector('[data-tag-manage]')?.addEventListener('click', () => {
      menu.classList.remove('open');
      openManagerModal();
    });
  }

  function renderTagsInput(cd, hostId){
    const host = document.getElementById(hostId);
    if (!host) return;
    const tags = cd ? getTagsOfCD(cd) : [];
    const allTags = getAllTags();
    host.innerHTML = `
      <div class="tags-input-wrap">
        <div class="tags-input-chips" id="tagsChipsHost">
          ${tags.map(t => renderChip(t)).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input type="text" id="tagsInput" list="tagsInputList" placeholder="Escribí una etiqueta y Enter" style="flex:1;padding:9px 12px;background:var(--bg2);border:1px solid var(--line);border-radius:9px;color:var(--txt);font-size:.9rem" autocomplete="off">
          <button type="button" class="btn" id="tagsAddBtn">➕ Agregar</button>
        </div>
        <datalist id="tagsInputList">
          ${allTags.map(t => `<option value="${esc(t)}"></option>`).join('')}
        </datalist>
        <div style="font-size:.72rem;color:var(--muted);margin-top:6px">
          ${MAX_TAGS_PER_CD} etiquetas máximo · minúsculas, sin acentos
        </div>
      </div>
    `;
    wireTagsInput(host);
  }

  function renderChip(tag){
    const color = colorForTag(tag);
    return `<span class="tag-chip" style="--tag-color:${esc(color)}" data-tag="${esc(tag)}">
      <span>${esc(tag)}</span>
      <button type="button" class="tag-chip-remove" title="Quitar" data-tag-remove="${esc(tag)}">✕</button>
    </span>`;
  }

  function wireTagsInput(host){
    const input = host.querySelector('#tagsInput');
    const addBtn = host.querySelector('#tagsAddBtn');
    const chipsHost = host.querySelector('#tagsChipsHost');

    function addTag(raw){
      const n = normalizeTag(raw);
      if (!n) return;
      if (host._tags.includes(n)){ input.value = ''; return; }
      if (host._tags.length >= MAX_TAGS_PER_CD){
        Toast.show(`Máximo ${MAX_TAGS_PER_CD} etiquetas`, 'warn', 2500);
        return;
      }
      host._tags.push(n);
      renderChips();
      input.value = '';
    }
    function renderChips(){
      chipsHost.innerHTML = host._tags.map(t => renderChip(t)).join('');
      chipsHost.querySelectorAll('[data-tag-remove]').forEach(b => {
        b.addEventListener('click', () => {
          const t = b.dataset.tagRemove;
          host._tags = host._tags.filter(x => x !== t);
          renderChips();
        });
      });
    }

    if (!host._tags){
      host._tags = [...chipsHost.querySelectorAll('[data-tag]')].map(el => el.dataset.tag);
    }
    renderChips();

    addBtn.addEventListener('click', () => addTag(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ','){ e.preventDefault(); addTag(input.value); }
      else if (e.key === 'Backspace' && !input.value && host._tags.length){
        host._tags.pop();
        renderChips();
      }
    });
  }

  function readTagsFromInput(hostId){
    const host = document.getElementById(hostId);
    return host && Array.isArray(host._tags) ? [...host._tags] : [];
  }

  return {
    MAX_TAGS_PER_CD, MAX_TAG_LENGTH,
    normalizeTag, parseTags, colorForTag,
    getAllTags, getTagCounts, getTagsOfCD,
    addTagToCD, removeTagFromCD, setTagsOnCD, deleteTagFromAll,
    openManagerModal, closeManagerModal,
    openFilterDropdown,
    renderTagsInput, readTagsFromInput
  };
})();

if (typeof window !== 'undefined') window.Tags = Tags;