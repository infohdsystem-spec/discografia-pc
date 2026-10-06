/* =========================================================================
   DISCOGRAFÍA v8.0.0 — UI Parte 2/4: Render tabla, artistas, stats, dashboard
   Autor: HDSystem IT · Tel: +54 9 11 4563-0851
   ========================================================================= */

const VIRTUAL_THRESHOLD = 100;
const VIRTUAL_BUFFER = 6;
const ROW_HEIGHT_DEFAULT = 74;

const VirtualTable = (() => {
  let _active = false;
  let _datos = [];
  let _rowHeight = ROW_HEIGHT_DEFAULT;
  let _scrollHandler = null;
  let _tbody = null;
  let _tableWrap = null;

  function isActive(){ return _active; }
  function setActive(v){ _active = !!v; }

  function reset(){
    if (_scrollHandler && _tableWrap){
      _tableWrap.removeEventListener('scroll', _scrollHandler);
      _scrollHandler = null;
    }
    _datos = [];
  }

  function measureRowHeight(){
    const firstRow = _tbody?.querySelector('tr[data-vt-real]');
    if (firstRow){
      const h = firstRow.getBoundingClientRect().height;
      if (h > 30 && h < 200) _rowHeight = h;
    }
  }

  function computeRange(total, rowHeight, viewportHeight, scrollTop, buffer){
    if (total <= 0) return { start: 0, end: 0, topPad: 0, bottomPad: 0 };
    const first = Math.floor(scrollTop / rowHeight);
    const visible = Math.ceil(viewportHeight / rowHeight);
    const start = Math.max(0, first - buffer);
    const end = Math.min(total, first + visible + buffer);
    const topPad = start * rowHeight;
    const bottomPad = Math.max(0, (total - end) * rowHeight);
    return { start, end, topPad, bottomPad };
  }

  function render(){
    if (!_active || !_tbody) return;
    const wrap = _tableWrap;
    if (!wrap) return;
    const total = _datos.length;
    const vh = wrap.clientHeight;
    const st = wrap.scrollTop;
    const { start, end, topPad, bottomPad } = computeRange(total, _rowHeight, vh, st, VIRTUAL_BUFFER);
    const frag = document.createDocumentFragment();
    if (topPad > 0){
      const spacerTop = document.createElement('tr');
      spacerTop.className = 'vt-spacer';
      spacerTop.setAttribute('aria-hidden', 'true');
      spacerTop.innerHTML = `<td colspan="7" style="padding:0;border:0;height:${topPad}px"></td>`;
      frag.appendChild(spacerTop);
    }
    for (let i = start; i < end; i++){
      frag.appendChild(_buildRow(_datos[i], i));
    }
    if (bottomPad > 0){
      const spacerBot = document.createElement('tr');
      spacerBot.className = 'vt-spacer';
      spacerBot.setAttribute('aria-hidden', 'true');
      spacerBot.innerHTML = `<td colspan="7" style="padding:0;border:0;height:${bottomPad}px"></td>`;
      frag.appendChild(spacerBot);
    }
    _tbody.replaceChildren(frag);
  }

  function attachScroll(){
    if (_scrollHandler) return;
    _scrollHandler = () => { requestAnimationFrame(render); };
    _tableWrap.addEventListener('scroll', _scrollHandler, { passive: true });
  }

  function init(tbody, tableWrap, datos){
    _tbody = tbody;
    _tableWrap = tableWrap;
    _datos = datos;
    setTimeout(measureRowHeight, 50);
    attachScroll();
    render();
  }

  function update(datos){
    _datos = datos;
    render();
  }

  let _buildRow = () => document.createElement('tr');
  function setRowBuilder(fn){ _buildRow = fn; }

  return { isActive, setActive, init, update, render, reset, measureRowHeight, computeRange, setRowBuilder, getRowHeight: () => _rowHeight, getThreshold: () => VIRTUAL_THRESHOLD };
})();

function renderTabla(){
  const tbody = $("#tbodyCD");
  if (!App.cat){
    tbody.innerHTML = `<tr><td colspan="7" class="empty"><span class="big">📁</span>Creá una categoría.</td></tr>`;
    $("#cdCount").textContent = "—"; $("#checkAll").checked = false; updateSelectionBar(); return;
  }
  const datos = sortCDs(getFiltered());
  const q = App.q.trim();

  if (!datos.length){
    VirtualTable.reset();
    VirtualTable.setActive(false);
    tbody.innerHTML = `<tr><td colspan="7" class="empty"><span class="big">💿</span>No hay CDs.</td></tr>`;
  } else if (datos.length > VIRTUAL_THRESHOLD){
    VirtualTable.setActive(true);
    VirtualTable.setRowBuilder((cd, idx) => _buildRowElement(cd, q, idx));
    VirtualTable.init(tbody, $("#tableWrap"), datos);
  } else {
    VirtualTable.reset();
    VirtualTable.setActive(false);
    const frag = document.createDocumentFragment();
    datos.forEach((cd, idx) => frag.appendChild(_buildRowElement(cd, q, idx)));
    tbody.replaceChildren(frag);
  }

  const total = (App.cat === ALL_CATS) ? Store.total() : Store.getCDs(App.cat).length;
  const fa = Object.values(App.filters).some(v => v) || App.artista || App.q.trim() || App.subcat || App.tagFilter;
  const fN = (typeof formatNumber === 'function') ? formatNumber : (n => String(n));
  $("#cdCount").innerHTML = fa ? `Mostrando <b>${esc(fN(datos.length))}</b> de ${esc(fN(total))} · <b>filtrado</b>${datos.length > VIRTUAL_THRESHOLD ? ' · <span title="Virtual scrolling activo" style="color:var(--purple)">⚡virtual</span>' : ''}` : `Todos: <b>${esc(fN(total))}</b>${datos.length > VIRTUAL_THRESHOLD ? ' · <span title="Virtual scrolling activo" style="color:var(--purple)">⚡virtual</span>' : ''}`;
  $$("#tablaCD thead th[data-key]").forEach(th => { const k = th.dataset.key; th.classList.toggle("sorted", k === App.sortKey); th.querySelector(".arrow").textContent = k === App.sortKey ? (App.sortDir === 1 ? "▲" : "▼") : "▲"; });
  $("#checkAll").checked = datos.length > 0 && datos.every(cd => App.selected.has(cdKeyForView(cd)));
  updateSelectionBar();
  const chip = $("#activeArtistChip");
  if (chip){ if (App.artista){ chip.innerHTML = `<span class="artist-chip">🎤 <b>${esc(upper(App.artista))}</b> <button type="button" class="chip-remove" title="Quitar">✕</button></span>`; chip.querySelector(".chip-remove").addEventListener("click", (e) => { e.stopPropagation(); App.artista = null; renderAll(); }); } else chip.innerHTML = ""; }

  /* v7.9.0: chip de tag activo */
  const tagChip = $("#activeTagChip");
  if (tagChip){
    if (App.tagFilter){
      const color = (typeof Tags !== 'undefined') ? Tags.colorForTag(App.tagFilter) : 'var(--purple)';
      tagChip.innerHTML = `<span class="artist-chip" style="background:${color}22;border-color:${color}80;color:${color}">🏷️ <b>${esc(App.tagFilter)}</b> <button type="button" class="chip-remove" title="Quitar" style="color:${color}">✕</button></span>`;
      tagChip.querySelector(".chip-remove").addEventListener("click", (e) => {
        e.stopPropagation();
        App.tagFilter = null;
        renderAll();
      });
    } else {
      tagChip.innerHTML = '';
    }
  }

  const fab = $("#fabVerTodos"); if (fab) fab.classList.toggle("show", !!App.artista);
  const notice = $("#artFilterNotice"); const nn = $("#artFilterName");
  if (notice){ if (App.artista){ notice.classList.add("show"); if (nn) nn.textContent = upper(App.artista); } else notice.classList.remove("show"); }
  if (GridView.isEnabled()) GridView.render();
}

function _buildRowElement(cd, q, idx){
  const key = cdKeyForView(cd);
  const tr = document.createElement("tr");
  tr.dataset.key = key;
  tr.dataset.nro = cd.nro;
  tr.setAttribute('data-vt-real', '1');
  if (App.selected.has(key)) tr.classList.add("selected");
  if (App.focusedKey === key) tr.classList.add("focused");
  const loaned = Loans.isLoaned(cd);
  const overdue = Loans.isOverdue(cd);
  const coverHtml = (cd.portada && isSafeImageUrl(cd.portada))
    ? `<img class="cover-thumb" src="${safeImgSrc(cd.portada)}" alt="" loading="lazy" data-key="${esc(key)}" data-title="${esc(upper(cd.titulo))} — ${esc(upper(cd.interprete))}">`
    : `<div class="cover-placeholder" title="Sin portada">💿</div>`;
  const loanIcon = loaned ? ` <span class="loan-badge${overdue ? ' overdue' : ''}" title="${overdue ? 'VENCIDO' : 'Prestado'}">📤${overdue ? '!' : ''}</span>` : '';
  const hasLinks = cd.links && Object.keys(cd.links).length > 0;
  tr.innerHTML = `
    <td class="check"><input type="checkbox" ${App.selected.has(key)?"checked":""}></td>
    <td class="cover">${coverHtml}</td>
    <td class="num">${cd.nro}</td>
    <td class="titulo">${highlight(upper(cd.titulo), q)}${renderRowTags(cd)}</td>
    <td class="art" title="${esc(upper(cd.interprete))}">${highlight(upper(cd.interprete), q)}${loanIcon}</td>
    <td class="anio">${cd.anio ?? "—"}</td>
    <td class="actions">${hasLinks ? `<button type="button" class="stream-quick" title="Ver CD y sus links de streaming">🎧</button>` : ''}<button type="button" class="view" title="Ver">👁️</button><button type="button" class="edit" title="Editar">✏️</button><button type="button" class="del" title="Eliminar">🗑️</button></td>`;
  tr.querySelector("td.check input").addEventListener("change", e => { e.stopPropagation(); toggleSelect(key, e.target.checked); });
  tr.querySelector("td.art").addEventListener("click", () => {
    const act = App.artista === cd.interprete;
    setArtistFilter(act ? null : cd.interprete);
  });
  tr.querySelector(".stream-quick")?.addEventListener("click", e => { e.stopPropagation(); abrirVista(cd); setTimeout(() => { $("#viewBody")?.querySelector(".stream-grid")?.scrollIntoView({behavior:"smooth",block:"center"}); }, 150); });
  tr.querySelector(".view").addEventListener("click", e => { e.stopPropagation(); abrirVista(cd); });
  tr.querySelector(".edit").addEventListener("click", e => { e.stopPropagation(); abrirModal("editar", cd); });
  tr.querySelector(".del").addEventListener("click", e => { e.stopPropagation(); eliminarCD(cd); });
  const thumb = tr.querySelector(".cover-thumb");
  if (thumb){
    thumb.addEventListener("click", e => { e.stopPropagation(); Lightbox.open(cd.portada, `${cd.titulo} — ${cd.interprete}`, key); });
    thumb.addEventListener("error", () => { thumb.outerHTML = `<div class="cover-placeholder" title="Error">⚠️</div>`; });
  }
  tr.addEventListener("click", e => { if (e.target.closest("td.check") || e.target.closest("td.actions") || e.target.closest("td.cover")) return; App.focusedKey = key; updateFocusedRow(); });
  return tr;
}

function renderRowTags(cd){
  if (!cd || !Array.isArray(cd.tags) || !cd.tags.length) return '';
  const color = (typeof Tags !== 'undefined') ? Tags.colorForTag : (() => 'var(--purple)');
  return `<div class="row-tags">${cd.tags.slice(0, 4).map(t => `<span class="row-tag" style="--tag-color:${color(t)}">${esc(t)}</span>`).join('')}${cd.tags.length > 4 ? `<span class="row-tag-more">+${cd.tags.length - 4}</span>` : ''}</div>`;
}

function updateFocusedRow(){
  $$("#tbodyCD tr").forEach(tr => tr.classList.toggle("focused", tr.dataset.key === App.focusedKey));
  const el = findRowByKey(App.focusedKey);
  if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function renderArtistas(){
  if (!App.cat){ $("#listaArt").innerHTML = ""; $("#artCount").innerHTML = "—"; return; }
  const q = App.q.trim();
  const m = new Map();
  for (const cd of viewCDs()){ if (!cd.interprete) continue; m.set(cd.interprete, (m.get(cd.interprete) || 0) + 1); }
  const sortMode = Store.getPref('artSort', 'count');
  const lista = [...m.entries()].map(([nombre, count]) => ({ nombre, count }));
  if (sortMode === 'alpha'){ lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: 'base', numeric: true })); }
  else if (sortMode === 'alpha-desc'){ lista.sort((a, b) => b.nombre.localeCompare(a.nombre, "es", { sensitivity: 'base', numeric: true })); }
  else { lista.sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre, "es", { sensitivity: 'base', numeric: true })); }
  const max = Math.max(...lista.map(a => a.count), 1);
  const ul = $("#listaArt");
  const frag = document.createDocumentFragment();
  lista.forEach((a, i) => {
    const li = document.createElement("li");
    const act = App.artista === a.nombre;
    li.className = "art-item" + (act ? " active" : "");
    const rankLabel = (sortMode === 'count') ? String(i + 1) : a.nombre.charAt(0).toUpperCase();
    li.innerHTML = `<span class="art-rank">${esc(rankLabel)}</span><span class="art-info"><span class="art-name">${highlight(upper(a.nombre), q)}</span><span class="bar"><i style="width:${Math.round(a.count/max*100)}%"></i></span></span><span class="art-count">${a.count}</span>`;
    li.title = act ? `Quitar filtro` : `Ver los ${a.count} CDs`;
    li.setAttribute("role", "button"); li.setAttribute("tabindex", "0");
    li.addEventListener("click", () => { setArtistFilter(act ? null : a.nombre); });
    li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); li.click(); } });
    frag.appendChild(li);
  });
  ul.replaceChildren(frag);
  $("#artCount").innerHTML = `<b>${lista.length}</b> intérpretes${App.artista ? ` · <span style="color:var(--purple)">${esc(upper(App.artista))}</span>` : ""}`;
}

function renderStats(){
  const cds = viewCDs();
  const años = cds.map(c => c.anio).filter(a => a && a > 0);
  const min = años.length ? Math.min(...años) : 0, max = años.length ? Math.max(...años) : 0;
  const art = new Map();
  for (const c of cds) art.set(c.interprete, (art.get(c.interprete) || 0) + 1);
  const top = [...art.entries()].sort((a, b) => b[1] - a[1])[0];
  const cp = cds.filter(c => c.portada).length;
  const fN = (typeof formatNumber === 'function') ? formatNumber : (n => String(n));
  $("#stTotal").textContent = fN(cds.length);
  $("#stArt").textContent = fN(art.size);
  $("#stRango").textContent = años.length ? `${min}–${max}` : "—";
  const st = $("#stTop");
  if (top){ const fn = top[0]; st.textContent = `${fn.length > 14 ? fn.slice(0, 14) + "…" : fn} (${top[1]})`; st.title = `${fn} — ${top[1]} CDs`; } else { st.textContent = "—"; st.title = ""; }
  $("#stCovers").textContent = `${cp}/${cds.length}`;
  $("#fTotal").textContent = fN(Store.total());
}

let _charts = {};
function computeDash(){
  const all = Store.allCDs(); const total = all.length;
  const aS = new Set(); const sM = new Map(); const yM = new Map(); const dM = new Map();
  let cU = 0, cV = 0, cS = 0, cG = 0, cA = 0, cC = 0, cP = 0, vT = 0;
  for (const cd of all){
    if (cd.interprete) aS.add(cd.interprete);
    if (cd.sello){ sM.set(cd.sello, (sM.get(cd.sello) || 0) + 1); cS++; }
    if (cd.anio && cd.anio > 0){ yM.set(cd.anio, (yM.get(cd.anio) || 0) + 1); const d = Math.floor(cd.anio / 10) * 10; dM.set(d, (dM.get(d) || 0) + 1); cA++; }
    if (cd.ubicacion) cU++; if (cd.genero) cG++; if (cd.catalogo) cC++; if (cd.portada) cP++;
    if (cd.valor != null && Number.isFinite(Number(cd.valor))){ const cn = Math.max(1, parseInt(cd.cantidad) || 1); vT += Number(cd.valor) * cn; cV++; }
  }
  const años = all.map(c => c.anio).filter(a => a && a > 0);
  const aMin = años.length ? Math.min(...años) : null, aMax = años.length ? Math.max(...años) : null;
  const aM = new Map();
  for (const cd of all){ if (cd.interprete) aM.set(cd.interprete, (aM.get(cd.interprete) || 0) + 1); }
  const topA = [...aM.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topA40 = [...aM.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
  const topS = [...sM.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topY = [...yM.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const dec = [...dM.entries()].sort((a, b) => a[0] - b[0]);
  const catD = Store.catKeys().map(k => ({ key: k, label: Store.get(k).label, icon: Store.get(k).icon, count: Store.getCDs(k).length }));
  return { total, artistas: aS.size, valorTotal: vT, añoMin: aMin, añoMax: aMax, topArtistas: topA, topArtistasAll: topA40, topSellos: topS, topAnios: topY, decadas: dec, catData: catD, conUbicacion: cU, conValor: cV, conSello: cS, conGenero: cG, conAnio: cA, conCatalogo: cC, conPortada: cP };
}
function destroyCharts(){
  for (const id in _charts){ try { _charts[id].destroy(); } catch(e){} delete _charts[id]; }
}
function renderDashboard(){
  if (!Store.catKeys().length) return;
  const d = computeDash();
  const fN = (typeof formatNumber === 'function') ? formatNumber : (n => String(n));
  const fC = (typeof formatCurrency === 'function') ? formatCurrency : ((n, c) => `$${n}`);
  const fP = (typeof formatPercent === 'function') ? formatPercent : (n => `${Math.round(n*100)}%`);
  const tr = (k, p) => (typeof t === 'function') ? t(k, p) : k;
  const kpis = [
    { icon:"💿", label:tr('footer.total'), value:fN(d.total), sub: (typeof tPlural === 'function') ? tPlural('unit.category', Store.catKeys().length) : `${Store.catKeys().length} categorías` },
    { icon:"🎤", label:tr('panel.artists'), value:fN(d.artistas), sub: d.total && d.artistas ? tr('unit.cds_per_artist', { n: (d.total/d.artistas).toFixed(1) }) : "—" },
    { icon:"📅", label:tr('col.year'), value:d.añoMin && d.añoMax ? `${d.añoMin}–${d.añoMax}` : "—", sub: d.añoMin ? tr('unit.years_count', { n: d.añoMax - d.añoMin + 1 }) : "" },
    { icon:"💰", label: "Valor", value: d.valorTotal > 0 ? fC(d.valorTotal, "ARS") : "—", sub: d.conValor > 0 ? tr('unit.with_value', { n: d.conValor }) : "" },
    { icon:"🖼️", label:tr('filter.cover'), value:`${d.conPortada}/${d.total}`, sub: d.total > 0 ? fP(d.conPortada/d.total) : "" }
  ];
  $("#dashKpiRow").innerHTML = kpis.map(k => `<div class="dash-kpi"><div class="kpi-icon">${k.icon}</div><div class="kpi-text"><div class="kpi-label">${esc(k.label)}</div><div class="kpi-value">${esc(k.value)}</div><div class="kpi-sub">${esc(k.sub)}</div></div></div>`).join("");
  const chAv = typeof Chart !== "undefined";
  const colors = ["#4fc3f7","#a78bfa","#ffca28","#5ddc9a","#ff6b6b","#ffa94d","#f472b6","#34d399","#60a5fa","#fbbf24","#c084fc","#f87171"];
  function upsert(id, cfg){
    const cv = document.getElementById(id);
    if (!chAv || !cv) return;
    if (_charts[id]){
      try {
        if (_charts[id].canvas === cv){ _charts[id].data = cfg.data; _charts[id].update('none'); return; }
        _charts[id].destroy();
      } catch(e){ try { _charts[id].destroy(); } catch(_){} }
      delete _charts[id];
    }
    try { _charts[id] = new Chart(cv, cfg); } catch(e){ console.warn(id, e); }
  }
  upsert("chartCategorias", { type:"doughnut", data:{ labels: d.catData.map(c => c.icon + " " + c.label), datasets: [{ data: d.catData.map(c => c.count), backgroundColor: colors, borderColor: "rgba(14,17,22,.6)", borderWidth: 2 }] }, options:{ responsive: true, maintainAspectRatio: false, plugins:{ legend:{ position:"bottom", labels:{ color:"#e6ebf2", font:{ size:11 }, boxWidth:12, padding:10 } } } } });
  upsert("chartArtistas", { type:"bar", data:{ labels: d.topArtistas.map(([n]) => n.length > 22 ? n.slice(0,20) + "…" : n), datasets:[{ label:"CDs", data: d.topArtistas.map(([,n]) => n), backgroundColor: "rgba(167,139,250,.7)", borderColor: "#a78bfa", borderWidth: 1, borderRadius: 4 }] }, options:{ indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins:{ legend:{ display: false } }, scales:{ x:{ ticks:{ color:"#8b97a8", font:{ size:10 } }, grid:{ color:"rgba(37,45,58,.4)" } }, y:{ ticks:{ color:"#e6ebf2", font:{ size:10 } }, grid:{ display: false } } } } });
  let acc = 0; const dAcc = d.decadas.map(([,n]) => (acc += n));
  upsert("chartDecadas", { type:"bar", data:{ labels: d.decadas.map(([dc]) => `${dc}s`), datasets:[{ label:"CDs", data: d.decadas.map(([,n]) => n), backgroundColor: "rgba(255,202,40,.55)", borderColor: "#ffca28", borderWidth: 1, borderRadius: 4, yAxisID: "y" }, { type:"line", label:"Acumulado", data: dAcc, borderColor: "#4fc3f7", backgroundColor: "rgba(79,195,247,.15)", borderWidth: 2, tension: .35, pointRadius: 4, pointBackgroundColor: "#4fc3f7", fill: true, yAxisID: "y1" }] }, options:{ responsive: true, maintainAspectRatio: false, plugins:{ legend:{ labels:{ color:"#e6ebf2", font:{ size:11 }, boxWidth:12 } } }, scales:{ x:{ ticks:{ color:"#8b97a8", font:{ size:10 } }, grid:{ display: false } }, y:{ position:"left", ticks:{ color:"#ffca28", font:{ size:10 } }, grid:{ color:"rgba(37,45,58,.4)" } }, y1:{ position:"right", ticks:{ color:"#4fc3f7", font:{ size:10 } }, grid:{ display: false } } } } });
  const sEl = $("#topSellos"); if (sEl) sEl.innerHTML = d.topSellos.length ? d.topSellos.map(([n, v], i) => `<li><span class="tl-rank">${i+1}</span><span class="tl-name" title="${esc(n)}">${esc(n)}</span><span class="tl-value">${v}</span></li>`).join("") : `<li style="color:var(--muted);justify-content:center">Sin datos</li>`;
  const yEl = $("#topAnios"); if (yEl) yEl.innerHTML = d.topAnios.length ? d.topAnios.map(([n, v], i) => `<li><span class="tl-rank">${i+1}</span><span class="tl-name">${n}</span><span class="tl-value">${v}</span></li>`).join("") : `<li style="color:var(--muted);justify-content:center">Sin datos</li>`;
  const wc = $("#wordcloud");
  if (wc){ if (d.topArtistasAll.length){ const mv = d.topArtistasAll[0][1]; wc.innerHTML = d.topArtistasAll.map(([n, v]) => { const s = 0.8 + (v/mv)*1.4; const o = 0.5 + (v/mv)*0.5; return `<span style="font-size:${s}rem;opacity:${o}" title="${esc(n)}: ${v} CDs">${esc(n)}</span>`; }).join(""); } else wc.innerHTML = `<span style="color:var(--muted)">Sin datos</span>`; }
  const hI = [
    { label:"Con año", val: d.conAnio, total: d.total },
    { label:"Con sello", val: d.conSello, total: d.total },
    { label:"Con género", val: d.conGenero, total: d.total },
    { label:"Con ubicación", val: d.conUbicacion, total: d.total },
    { label:"Con Nº catálogo", val: d.conCatalogo, total: d.total },
    { label:"Con valor", val: d.conValor, total: d.total },
    { label:"Con portada", val: d.conPortada, total: d.total }
  ];
  const hg = $("#healthGrid");
  if (hg) hg.innerHTML = hI.map(h => { const p = h.total ? Math.round(h.val / h.total * 100) : 0; return `<div class="health-item"><div class="hi-label">${h.label}</div><div class="hi-value">${h.val} <span style="font-size:.7rem;color:var(--muted);font-weight:400">/ ${h.total}</span></div><div class="hi-bar"><i style="width:${p}%"></i></div><div style="font-size:.65rem;color:var(--muted);text-align:right">${p}%</div></div>`; }).join("");
  renderProjection(d.valorTotal);
}
function renderProjection(vA){
  const ts = $("#projTasa"); if (!ts) return;
  const años = parseInt($("#projAnios").value) || 10;
  let tasa = parseFloat(ts.value); if (ts.value === "custom") tasa = (parseFloat($("#projCustom").value) || 0) / 100;
  let base = $("#projBase").value === "manual" ? (parseFloat($("#projManual").value) || 0) : vA;
  const fut = base * Math.pow(1 + tasa, años); const gan = fut - base; const roi = base > 0 ? ((fut / base) - 1) * 100 : 0;
  const r = $("#projectionResult"); if (!r) return;
  const fC = (typeof formatCurrency === 'function') ? formatCurrency : ((n, c) => `$${n}`);
  r.innerHTML = `<div class="pr-item"><div class="pr-label">Valor actual</div><div class="pr-value">${esc(fC(base, "ARS"))}</div></div><div class="pr-item"><div class="pr-label">En ${años} años</div><div class="pr-value ${fut >= base ? 'green' : 'red'}">${esc(fC(fut, "ARS"))}</div></div><div class="pr-item"><div class="pr-label">Ganancia/Pérdida</div><div class="pr-value ${gan >= 0 ? 'green' : 'red'}">${gan >= 0 ? '+' : ''}${esc(fC(gan, "ARS"))}</div></div><div class="pr-item"><div class="pr-label">ROI</div><div class="pr-value ${roi >= 0 ? 'green' : 'red'}">${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%</div></div>`;
}
function setView(v){
  App.view = v; const isD = v === "dashboard";
  $("#tableView").style.display = isD ? "none" : "";
  $("#dashboardView").classList.toggle("active", isD);
  $("#panelArtistas").classList.toggle("hidden-panel", isD);
  const b = $("#btnVista"); b.innerHTML = isD ? `<span class="ico">📋</span><span>Tabla</span>` : `<span class="ico">📊</span><span>Panel</span>`;
  b.classList.toggle("active", isD);
  if (isD) renderDashboard(); else { destroyCharts(); renderTabla(); renderArtistas(); renderStats(); }
}
function renderAll(){
  ensureValidCat();
  renderSubtabs();
  const ie = Store.isEmpty;
  $("#emptyState").classList.toggle("hidden", !ie);
  $("#tableView").style.display = ie || App.view === "dashboard" ? "none" : "";
  $("#dashboardView").classList.toggle("active", !ie && App.view === "dashboard");
  const ap = $("#panelArtistas");
  if (ap){ ap.classList.toggle("hidden-panel", ie || App.view === "dashboard"); }
  if (!ie){ if (App.view === "dashboard") renderDashboard(); else { renderTabla(); renderArtistas(); } renderStats(); }
  else { $("#cdCount").textContent = "—"; $("#artCount").textContent = "—"; $("#stTotal").textContent = "0"; $("#stArt").textContent = "0"; $("#stRango").textContent = "—"; $("#stTop").textContent = "—"; $("#stCovers").textContent = "0/0"; $("#fTotal").textContent = "0"; }
  const n = Store.catKeys().length;
  const catsLabel = (typeof tPlural === 'function') ? tPlural('unit.category', n) : (n + " categoría" + (n === 1 ? "" : "s"));
  $("#subtitle").textContent = "Discografía v" + APP_VERSION + " · " + catsLabel;
  NotFoundList.updateBadge(); FileSystemDefault.refreshBadge();
  const fab = $("#fabVerTodos"); if (fab) fab.classList.toggle("show", !!App.artista);
  DuplicateChecker.invalidate();
  if (GridView.isEnabled()) GridView.render();
}
function toggleSelect(k, c){
  if (c) App.selected.add(k); else App.selected.delete(k);
  const tr = findRowByKey(k);
  if (tr) tr.classList.toggle("selected", c);
  updateSelectionBar();
  syncCheckAll();
  if (GridView.isEnabled()) GridView.render();
}
function updateSelectionBar(){ const b = $("#selectionBar"); if (App.selected.size === 0){ b.classList.remove("show"); return; } b.classList.add("show"); $("#selCount").textContent = App.selected.size; }
function syncCheckAll(){ const a = $$("#tbodyCD tr[data-vt-real]").length; const c = $$("#tbodyCD tr.selected").length; $("#checkAll").checked = a > 0 && c === a; $("#checkAll").indeterminate = c > 0 && c < a; }

const GridView = (() => {
  let enabled = false;
  function isEnabled(){ return enabled; }
  function setEnabled(v){
    enabled = !!v;
    const btn = $('#btnGrid'); if (btn) btn.classList.toggle('active', enabled);
    const tw = $('#tableWrap'); const gw = $('#gridWrap');
    if (gw) gw.style.display = enabled ? '' : 'none';
    if (tw) tw.style.display = enabled ? 'none' : '';
    if (enabled) render();
  }
  function render(){
    if (!enabled || !App.cat) return;
    const w = $('#gridWrap'); if (!w) return;
    const datos = sortCDs(getFiltered());
    if (!datos.length){ w.innerHTML = '<div style="grid-column:1/-1;padding:60px 20px;text-align:center;color:var(--muted)"><span style="font-size:3rem;opacity:.5;display:block;margin-bottom:12px">💿</span>No hay CDs</div>'; return; }
    w.innerHTML = datos.map(cd => {
      const key = cdKeyForView(cd);
      const isSel = App.selected.has(key);
      const loaned = Loans.isLoaned(cd); const ov = Loans.isOverdue(cd);
      const dup = DuplicateChecker.isDuplicate(cd);
      const cover = (cd.portada && isSafeImageUrl(cd.portada)) ? `<img src="${safeImgSrc(cd.portada)}" alt="" loading="lazy">` : `<div class="gc-placeholder">💿</div>`;
      const badges = [];
      if (loaned) badges.push(`<span class="gc-badge loan">📤${ov ? '!' : ''}</span>`);
      if (dup) badges.push(`<span class="gc-badge dup">🔍</span>`);
      return `<div class="grid-card${isSel ? ' selected' : ''}" data-gc-key="${esc(key)}">
        <div class="gc-check" data-gc-check="${esc(key)}">${isSel ? '✓' : ''}</div>
        ${badges.length ? `<div class="gc-badges">${badges.join('')}</div>` : ''}
        <div class="gc-cover" data-gc-open="${esc(key)}">${cover}</div>
        <div class="gc-title" title="${esc(upper(cd.titulo))}">${esc(upper(cd.titulo))}</div>
        <div class="gc-artist" title="${esc(upper(cd.interprete))}">${esc(upper(cd.interprete))}</div>
        <div class="gc-meta"><span class="gc-nro">#${cd.nro}</span><span class="gc-year">${cd.anio ?? '—'}</span></div>
        <div class="gc-actions">
          <button type="button" data-gc-view="${esc(key)}" title="Ver">👁️</button>
          <button type="button" data-gc-edit="${esc(key)}" title="Editar">✏️</button>
          <button type="button" data-gc-del="${esc(key)}" title="Eliminar">🗑️</button>
        </div>
      </div>`;
    }).join('');
    w.querySelectorAll('[data-gc-check]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const k = el.dataset.gcCheck; toggleSelect(k, !App.selected.has(k)); render(); }); });
    w.querySelectorAll('[data-gc-open]').forEach(el => { el.addEventListener('click', () => { const { cat, id } = parseCDKey(el.dataset.gcOpen); const cd = Store.getCDs(cat).find(c => c.id === id); if (cd && cd.portada) Lightbox.open(cd.portada, `${cd.titulo} — ${cd.interprete}`, el.dataset.gcOpen); }); });
    w.querySelectorAll('[data-gc-view]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const { cat, id } = parseCDKey(el.dataset.gcView); const cd = Store.getCDs(cat).find(c => c.id === id); if (cd) abrirVista(cd); }); });
    w.querySelectorAll('[data-gc-edit]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const { cat, id } = parseCDKey(el.dataset.gcEdit); const cd = Store.getCDs(cat).find(c => c.id === id); if (cd) abrirModal('editar', cd); }); });
    w.querySelectorAll('[data-gc-del]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const { cat, id } = parseCDKey(el.dataset.gcDel); const cd = Store.getCDs(cat).find(c => c.id === id); if (cd) eliminarCD(cd); }); });
  }
  return { isEnabled, setEnabled, render };
})();

/* =========================================================================
   [FIN app-ui-2-render.js v8.0.0]
   ========================================================================= */