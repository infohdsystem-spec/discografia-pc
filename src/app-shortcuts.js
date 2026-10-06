/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Atajos de teclado (modal + referencia)
   Autor: HDSystem IT
   ========================================================================= */

const Shortcuts = (() => {
  const GROUPS = [
    { title: '📚 General', items: [
      { keys: ['F1'], desc: 'Abrir manual de uso' },
      { keys: ['F2'], desc: 'Ver atajos de teclado' },
      { keys: ['Ctrl','Shift','K'], desc: 'Command palette' },
      { keys: ['Ctrl','Shift','T'], desc: 'Cambiar tema claro/oscuro' },
      { keys: ['Ctrl','Shift','Q'], desc: 'Salir del sistema' }
    ]},
    { title: '💿 CDs', items: [
      { keys: ['Ctrl','N'], desc: 'Nuevo CD' },
      { keys: ['Enter'], desc: 'Editar CD enfocado' },
      { keys: ['Delete'], desc: 'Eliminar CD enfocado' },
      { keys: ['Espacio'], desc: 'Seleccionar/deseleccionar CD' },
      { keys: ['↑','↓'], desc: 'Navegar por la lista' }
    ]},
    { title: '📁 Categorías y filtros', items: [
      { keys: ['Ctrl','K'], desc: 'Nueva categoría' },
      { keys: ['Ctrl','F'], desc: 'Mostrar filtros avanzados' },
      { keys: ['Esc'], desc: 'Limpiar búsqueda y filtros' }
    ]},
    { title: '📊 Vistas', items: [
      { keys: ['Ctrl','D'], desc: 'Panel de control' },
      { keys: ['Ctrl','G'], desc: 'Vista cuadrícula' },
      { keys: ['Ctrl','Shift','P'], desc: 'Etiquetas imprimibles' }
    ]},
    { title: '✨ Acciones', items: [
      { keys: ['Ctrl','E'], desc: 'Enriquecer colección' },
      { keys: ['Ctrl','S'], desc: 'Exportar backup JSON' },
      { keys: ['Ctrl','Z'], desc: 'Deshacer última acción' }
    ]},
    { title: '🔍 Herramientas', items: [
      { keys: ['Ctrl','Shift','D'], desc: 'Buscar duplicados' },
      { keys: ['Ctrl','Shift','L'], desc: 'Ver préstamos' },
      { keys: ['Ctrl','Shift','H'], desc: 'Historial de actividad' }
    ]}
  ];

  function openModal(){
    let m = document.getElementById('shortcutsModal');
    if (!m){
      m = build();
      document.body.appendChild(m);
    }
    m.classList.add('open');
  }
  function closeModal(){
    document.getElementById('shortcutsModal')?.classList.remove('open');
  }

  function build(){
    const m = document.createElement('div');
    m.id = 'shortcutsModal';
    m.className = 'modal-overlay';
    m.style.zIndex = '460';
    m.innerHTML = `
      <div class="modal wide" role="dialog" aria-modal="true" style="max-width:780px">
        <div class="modal-head">
          <h3><span>⌨️</span><span>Atajos de teclado</span></h3>
          <button type="button" class="close" id="shortcutsClose">✕</button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-grid">
            ${GROUPS.map(g => `
              <div class="shortcuts-group">
                <h4>${esc(g.title)}</h4>
                ${g.items.map(it => `
                  <div class="shortcut-row">
                    <span class="shortcut-keys">${it.keys.map(k => `<kbd>${esc(k)}</kbd>`).join('')}</span>
                    <span class="shortcut-desc">${esc(it.desc)}</span>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-foot">
          <div style="font-size:.75rem;color:var(--muted)">💡 En Mac, usá <kbd>Cmd</kbd> en lugar de <kbd>Ctrl</kbd></div>
          <div class="right"><button type="button" class="btn primary" id="shortcutsCloseBtn">Cerrar</button></div>
        </div>
      </div>
    `;
    m.querySelector('#shortcutsClose').addEventListener('click', closeModal);
    m.querySelector('#shortcutsCloseBtn').addEventListener('click', closeModal);
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
    return m;
  }

  return { openModal, closeModal, GROUPS };
})();

if (typeof window !== 'undefined') window.Shortcuts = Shortcuts;