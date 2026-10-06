/* =========================================================================
   Discografía v8.0.0 — Funciones puras extraídas para testing
   ========================================================================= */

export const ALLOWED_STREAM_DOMAINS = [
  'open.spotify.com',
  'music.youtube.com','youtube.com','youtu.be',
  'music.apple.com','itunes.apple.com',
  'discogs.com',
  'last.fm','www.last.fm'
];

export const SCHEMA_VERSION = 6;

export const norm = s => String(s ?? '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
export const upper = v => (v === null || v === undefined) ? "" : String(v).toUpperCase();
export const normMatch = s => String(s||'').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();

export function stripParenthetical(s){
  return String(s||'').replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function levenshtein(a, b){
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

export function stripArticles(s){ return String(s||'').replace(/^(the|a|an|el|la|los|las|un|una)\s+/i,'').replace(/\s+(the|a|an|el|la|los|las|un|una)$/i,'').trim(); }

export function similarity(a, b){
  const x = normMatch(stripArticles(a)), y = normMatch(stripArticles(b));
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.includes(y) || y.includes(x)) return 0.9;
  const A = new Set(x.split(' ')), B = new Set(y.split(' '));
  const inter = [...A].filter(v => B.has(v)).length;
  const union = new Set([...A, ...B]).size;
  const j = union ? inter / union : 0;
  const lev = 1 - levenshtein(x, y) / Math.max(x.length, y.length);
  return Math.max(j, lev * 0.9);
}

export function matchConfidence(t, i, cand){
  return Math.round((similarity(t, cand.title) * 0.6 + similarity(i, cand.artist) * 0.4) * 100);
}

export function esSoloOrtografia(a, b){
  const A = String(a||'').trim(), B = String(b||'').trim();
  if (!A || !B) return false;
  const an = normMatch(A), bn = normMatch(B);
  if (an === bn) return true;
  const ap = normMatch(stripParenthetical(A));
  const bp = normMatch(stripParenthetical(B));
  if (ap && bp && ap === bp) return true;
  const wa = an.split(' ').filter(Boolean);
  const wb = bn.split(' ').filter(Boolean);
  if (wa.length === wb.length && wa.length > 0){
    let sameCount = 0;
    for (let i = 0; i < wa.length; i++){
      if (wa[i] === wb[i]){ sameCount++; continue; }
      const wLev = levenshtein(wa[i], wb[i]);
      const maxLen = Math.max(wa[i].length, wb[i].length);
      if (maxLen > 0 && wLev / maxLen <= 0.35) sameCount++;
    }
    if (sameCount === wa.length) return true;
  }
  const sim = similarity(A, B);
  const lenDiff = Math.abs(A.length - B.length);
  if (sim >= 0.90 && lenDiff <= 3) return true;
  return false;
}

export function corregirCampo(valorActual, valorAPI, confianza, replace, umbralMin = 85){
  const cur = String(valorActual || '').trim();
  const api = String(valorAPI  || '').trim();
  if (!api) return null;
  if (Number(confianza) < umbralMin) return null;
  if (cur === api) return null;
  if (!cur) return api;
  if (esSoloOrtografia(cur, api)) return api;
  if (replace) return api;
  return null;
}

export function isSafeImageUrl(url){
  if (!url || typeof url !== 'string') return false;
  if (/^https?:\/\//i.test(url)) return true;
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(url)) return true;
  if (/^blob:/i.test(url)) return true;
  return false;
}

export function isSafeStreamUrl(url){
  if (!url || typeof url !== 'string') return false;
  if (!/^https:\/\//i.test(url)) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return ALLOWED_STREAM_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch(e){ return false; }
}

export function isAlbumUrl(url, svcKey){
  if (!url) return false;
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase() + u.search.toLowerCase();
    switch(svcKey){
      case 'spotify':    return path.includes('/album/') && !path.includes('/track/') && !path.includes('/playlist/');
      case 'apple':      return path.includes('/album/');
      case 'youtube':    return path.includes('olak5uy') || path.includes('/browse/') || path.includes('/playlist');
      case 'discogs':    return path.includes('/release/') || path.includes('/master/');
      case 'lastfm':     return path.includes('/music/') || path.includes('/album/');
      default: return true;
    }
  } catch(e){ return false; }
}

export function detectDelimiter(t){
  const f = String(t).split(/\r?\n/)[0] || "";
  return (f.match(/;/g) || []).length >= (f.match(/,/g) || []).length ? ";" : ",";
}

export function parseCSV(text, delim){
  const d = delim || detectDelimiter(text);
  const rows = []; let row = [], cur = "", inQ = false;
  for (let i = 0; i < text.length; i++){
    const c = text[i], n = text[i+1];
    if (inQ){ if (c === '"' && n === '"'){ cur += '"'; i++; } else if (c === '"') inQ = false; else cur += c; }
    else { if (c === '"') inQ = true; else if (c === d){ row.push(cur); cur = ""; } else if (c === '\n'){ row.push(cur); rows.push(row); row = []; cur = ""; } else if (c === '\r'){} else cur += c; }
  }
  if (cur !== "" || row.length){ row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ""));
}

export function normalizeYear(y){
  if (y === null || y === undefined || y === '') return null;
  const n = parseInt(String(y).slice(0, 4), 10);
  if (!Number.isFinite(n)) return null;
  if (n < 1900 || n > 2100) return null;
  return n;
}

export function limpiarTituloParaBusqueda(titulo){
  let t = String(titulo || '').trim();
  if (!t) return '';
  t = t.replace(/[*#]+/g, ' ');
  t = t.replace(/\.{2,}/g, ' ');
  const parts = t.split(/\s*\/\s*/);
  if (parts.length === 2 && normMatch(parts[0]) === normMatch(parts[1])) t = parts[0];
  t = t.replace(/\s*\(\s*(en\s+vivo|live)\s*\)\s*$/i, '').trim();
  t = t.replace(/\s+(CD|VOL|VOLUMEN|PARTE|DISC|DISCO)\s*#?\s*\d+\s*$/i, '').trim();
  t = t.replace(/\s+GIRA\s+/i, ' ').trim();
  t = t.replace(/\s+([AB])\s*$/i, (m) => {
    const sinLado = t.replace(/\s+([AB])\s*$/i, '').trim();
    return sinLado.length >= 5 ? '' : m;
  }).trim();
  return t.replace(/\s+/g, ' ').trim();
}

/* ═══════════════════════════════════════════════════════════════════
   v7.2.0 — MIGRACIONES DE ESQUEMA
   ═══════════════════════════════════════════════════════════════════ */

export const MIGRATIONS = [
  {
    from: 1, to: 2,
    name: 'Categorías planas → objeto con metadatos',
    fn: d => {
      if (!d || typeof d !== 'object') return d;
      if (Array.isArray(d.categories)){
        const obj = {};
        for (const c of d.categories){
          const key = String(c.key || c.label || ('cat_' + Math.random().toString(36).slice(2, 8))).toLowerCase();
          obj[key] = { label: c.label || key, icon: c.icon || '📀', subcategories: [], cds: Array.isArray(c.cds) ? c.cds : [] };
        }
        d.categories = obj;
      }
      return d;
    }
  },
  {
    from: 4, to: 5,
    name: 'Aplanar estructura de CDs + normalizar campos',
    fn: d => {
      if (!d || typeof d !== 'object' || !d.categories) return d;
      for (const k in d.categories){
        const cat = d.categories[k];
        if (!cat || !Array.isArray(cat.cds)) continue;
        cat.cds = cat.cds.map(cd => {
          if (!cd || typeof cd !== 'object') return cd;
          if (!cd.id) cd.id = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'cd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2));
          if (!cd.links || typeof cd.links !== 'object' || Array.isArray(cd.links)) cd.links = {};
          if (!cd.customFields || typeof cd.customFields !== 'object') cd.customFields = {};
          if (!cd.provenance || typeof cd.provenance !== 'object') cd.provenance = {};
          if (cd.subcat === undefined) cd.subcat = null;
          return cd;
        });
        if (!Array.isArray(cat.subcategories)) cat.subcategories = [];
      }
      return d;
    }
  },
  {
    from: 5, to: 6,
    name: 'Normalizar prefs + agregar flagged de migración',
    fn: d => {
      if (!d || typeof d !== 'object') return d;
      const defaults = { enrich: true, autoBackup: true, replaceOnEnrich: true };
      d.prefs = Object.assign({}, defaults, d.prefs || {});
      if (d.seeded === undefined) d.seeded = true;
      return d;
    }
  }
];

export function migrateBackup(raw, fromVersion, migrations = MIGRATIONS){
  if (!raw || typeof raw !== 'object') return { data: raw, applied: [] };
  const current = Number(fromVersion) || 1;
  if (current >= SCHEMA_VERSION) return { data: raw, applied: [] };
  let data = JSON.parse(JSON.stringify(raw));
  const applied = [];
  for (const m of migrations){
    if (m.from >= current && m.from < SCHEMA_VERSION){
      try {
        const next = m.fn(data);
        if (next && typeof next === 'object') data = next;
        applied.push({ from: m.from, to: m.to, name: m.name });
      } catch(e){
        console.warn(`[migrateBackup] Migración ${m.from} → ${m.to} falló:`, e);
      }
    }
  }
  data.version = SCHEMA_VERSION;
  return { data, applied };
}

/* ═══════════════════════════════════════════════════════════════════
   v7.3.0 — VIRTUAL SCROLLING + CONCURRENCIA
   ═══════════════════════════════════════════════════════════════════ */

export function computeVirtualRange(total, rowHeight, viewportHeight, scrollTop, buffer = 6){
  if (total <= 0) return { start: 0, end: 0, topPad: 0, bottomPad: 0 };
  if (!Number.isFinite(rowHeight) || rowHeight <= 0) rowHeight = 1;
  if (!Number.isFinite(viewportHeight) || viewportHeight < 0) viewportHeight = 0;
  if (!Number.isFinite(scrollTop) || scrollTop < 0) scrollTop = 0;
  if (!Number.isFinite(buffer) || buffer < 0) buffer = 0;

  const first = Math.floor(scrollTop / rowHeight);
  const visible = Math.ceil(viewportHeight / rowHeight);
  const start = Math.max(0, first - buffer);
  const end = Math.min(total, first + visible + buffer);
  const topPad = start * rowHeight;
  const bottomPad = Math.max(0, (total - end) * rowHeight);
  return { start, end, topPad, bottomPad };
}

export function createLimiter(concurrency){
  const max = Math.max(1, parseInt(concurrency) || 1);
  let active = 0;
  const queue = [];
  function next(){
    if (active >= max || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve().then(() => fn()).then(
      v => { active--; resolve(v); next(); },
      e => { active--; reject(e); next(); }
    );
  }
  return function limit(fn){
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}

/* ═══════════════════════════════════════════════════════════════════
   v7.4.0 — MERGE DE DUPLICADOS
   ═══════════════════════════════════════════════════════════════════ */

export const MERGEABLE_FIELDS = [
  { key: 'titulo',      label: 'Título' },
  { key: 'interprete',  label: 'Intérprete' },
  { key: 'anio',        label: 'Año álbum' },
  { key: 'anioEdicion', label: 'Año edición' },
  { key: 'formato',     label: 'Formato' },
  { key: 'estado',      label: 'Estado' },
  { key: 'estadoDisco', label: 'Estado disco' },
  { key: 'estadoCaja',  label: 'Estado caja' },
  { key: 'sello',       label: 'Sello' },
  { key: 'genero',      label: 'Género' },
  { key: 'catalogo',    label: 'Nº catálogo' },
  { key: 'codigo',      label: 'Código de barras' },
  { key: 'isrc',        label: 'ISRC' },
  { key: 'edicion',     label: 'Edición' },
  { key: 'pais',        label: 'País' },
  { key: 'ubicacion',   label: 'Ubicación' },
  { key: 'valor',       label: 'Valor' },
  { key: 'moneda',      label: 'Moneda' },
  { key: 'notas',       label: 'Notas' },
  { key: 'portada',     label: 'Portada' },
  { key: 'prestadoA',   label: 'Prestado a' }
];

export function mergeCDs(a, b, choices = {}){
  if (!a && !b) return null;
  if (!a) return { ...b };
  if (!b) return { ...a };
  const merged = { ...a };
  for (const f of MERGEABLE_FIELDS){ if (choices[f.key] === 'b') merged[f.key] = b[f.key]; }
  merged.links = { ...(b.links || {}), ...(a.links || {}) };
  merged.customFields = { ...(b.customFields || {}), ...(a.customFields || {}) };
  merged.provenance = { ...(b.provenance || {}), ...(a.provenance || {}) };
  merged.tags = [...new Set([...(a.tags || []), ...(b.tags || [])])].slice(0, 12);
  const confA = Number(a.enrichmentConfidence) || 0;
  const confB = Number(b.enrichmentConfidence) || 0;
  if (confB > confA){
    merged.enrichmentSource = b.enrichmentSource || merged.enrichmentSource;
    merged.enrichmentConfidence = b.enrichmentConfidence || merged.enrichmentConfidence;
    merged.enrichedAt = b.enrichedAt || merged.enrichedAt;
  }
  merged.mbId = a.mbId || b.mbId || null;
  merged.discogsId = a.discogsId || b.discogsId || null;
  merged.id = a.id;
  merged.nro = a.nro;
  return merged;
}

/* ═══════════════════════════════════════════════════════════════════
   v7.5.0 — ETIQUETAS IMPRIMIBLES
   ═══════════════════════════════════════════════════════════════════ */

export function chunk(arr, n){
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const size = Math.max(1, parseInt(n) || 1);
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function qrPayload(cd, mode = 'url', baseUrl = ''){
  if (!cd) return '';
  if (mode === 'url'){
    const u = String(baseUrl || 'http://localhost').replace(/[#?].*$/, '');
    const params = new URLSearchParams();
    if (cd.id) params.set('cd', cd.id);
    if (cd.nro) params.set('n', String(cd.nro));
    if (cd.categoria) params.set('c', cd.categoria);
    return `${u}#open?${params.toString()}`;
  }
  const lines = [];
  if (cd.titulo) lines.push(`Título: ${cd.titulo}`);
  if (cd.interprete) lines.push(`Intérprete: ${cd.interprete}`);
  if (cd.anio) lines.push(`Año: ${cd.anio}`);
  if (cd.nro) lines.push(`Nº: ${cd.nro}`);
  if (cd.sello) lines.push(`Sello: ${cd.sello}`);
  if (cd.catalogo) lines.push(`Catálogo: ${cd.catalogo}`);
  return lines.join('\n');
}

export function formatLabelData(cd, fields = {}){
  const title = String(cd?.titulo || '').trim();
  const lines = [];
  const l1 = [];
  if (fields.interprete && cd?.interprete) l1.push(cd.interprete);
  if (fields.anio && cd?.anio) l1.push(String(cd.anio));
  if (l1.length) lines.push(l1.join(' · '));
  const l2 = [];
  if (fields.nro && cd?.nro) l2.push(`Nº ${cd.nro}`);
  if (fields.categoria && cd?.categoria) l2.push(String(cd.categoria).toUpperCase());
  if (fields.sello && cd?.sello) l2.push(String(cd.sello).toUpperCase());
  if (l2.length) lines.push(l2.join(' · '));
  if (fields.ubicacion && cd?.ubicacion) lines.push(`📍 ${cd.ubicacion}`);
  return { title, lines };
}

export function pagesNeeded(count, fmt){
  const perPage = Math.max(1, (fmt.cols || 1) * (fmt.rows || 1));
  return Math.max(1, Math.ceil((count || 0) / perPage));
}

/* ═══════════════════════════════════════════════════════════════════
   v7.6.0 — i18n helpers
   ═══════════════════════════════════════════════════════════════════ */

export function format(str, params = {}){
  if (!params || typeof params !== 'object') return String(str);
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in params) ? String(params[k]) : m);
}

export function translate(dict, lang, key, params = {}){
  if (!dict || typeof dict !== 'object') return key;
  const current = dict[lang] || {};
  const fallback = dict.es || {};
  let str = current[key];
  if (str === undefined) str = fallback[key];
  if (str === undefined) return key;
  return format(str, params);
}

/* ═══════════════════════════════════════════════════════════════════
   v7.7.0 — Intl helpers (puros)
   ═══════════════════════════════════════════════════════════════════ */

export function formatNumberWith(n, locale = 'es-AR', decimals = 0){
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch(e){ return String(num); }
}

export function formatCurrencyWith(n, currency, locale = 'es-AR'){
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: String(currency || 'ARS').toUpperCase(),
      maximumFractionDigits: 0
    }).format(num);
  } catch(e){
    try { return new Intl.NumberFormat(locale, { style: 'decimal', maximumFractionDigits: 0 }).format(num) + ' ' + currency; }
    catch(e2){ return `${num} ${currency}`; }
  }
}

export function formatDateWith(d, locale = 'es-AR', style = 'short'){
  let dt;
  if (d instanceof Date) dt = d;
  else if (typeof d === 'number') dt = new Date(d);
  else if (typeof d === 'string' && d) dt = new Date(d);
  else return '';
  if (isNaN(dt.getTime())) return '';
  const map = {
    short:   { dateStyle: 'short' },
    medium:  { dateStyle: 'medium' },
    long:    { dateStyle: 'long' },
    numeric: { year: 'numeric', month: '2-digit', day: '2-digit' }
  };
  try { return new Intl.DateTimeFormat(locale, map[style] || map.short).format(dt); }
  catch(e){ return dt.toLocaleDateString(); }
}

export function formatPercentWith(n, locale = 'es-AR', decimals = 0){
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  try { return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(num); }
  catch(e){ return `${(num * 100).toFixed(decimals)}%`; }
}

/* ═══════════════════════════════════════════════════════════════════
   v7.8.0 — Workspace helpers
   ═══════════════════════════════════════════════════════════════════ */

export const WORKSPACE_COLORS = ['#4fc3f7','#a78bfa','#ffca28','#5ddc9a','#ff6b6b','#ffa94d','#f472b6','#34d399','#60a5fa','#fbbf24','#c084fc','#f87171'];

export function workspaceSlugify(name){
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32) || ('ws_' + Date.now().toString(36));
}

export function generateWorkspaceId(name, existing = []){
  const base = workspaceSlugify(name);
  const ids = new Set((existing || []).map(w => w.id));
  if (!ids.has(base)) return base;
  let i = 2;
  while (ids.has(base + '_' + i)) i++;
  return base + '_' + i;
}

export function validateWorkspaceName(name, existing = [], currentId = null){
  const clean = String(name || '').trim();
  if (!clean) return { ok: false, error: 'name_empty' };
  if (clean.length > 40) return { ok: false, error: 'name_too_long' };
  const lower = clean.toLowerCase();
  const dup = (existing || []).find(w => w.id !== currentId && String(w.name || '').toLowerCase() === lower);
  if (dup) return { ok: false, error: 'name_duplicated' };
  return { ok: true };
}

export function workspaceColorFromSeed(seed){
  const s = String(seed || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return WORKSPACE_COLORS[Math.abs(h) % WORKSPACE_COLORS.length];
}

export function isSafeWorkspaceId(id){
  return typeof id === 'string' && /^[a-z0-9_]{1,40}$/.test(id);
}

/* ═══════════════════════════════════════════════════════════════════
   v7.9.0 — Tags helpers
   ═══════════════════════════════════════════════════════════════════ */

export const TAG_MAX_PER_CD = 12;
export const TAG_MAX_LENGTH = 30;

export function normalizeTag(t){
  return String(t || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, TAG_MAX_LENGTH);
}

export function parseTags(str){
  if (!str) return [];
  return [...new Set(
    String(str).split(/[,\n]/).map(normalizeTag).filter(Boolean)
  )].slice(0, TAG_MAX_PER_CD);
}

export function tagMatches(cdTags, query){
  const tags = Array.isArray(cdTags) ? cdTags : [];
  const wanted = String(query || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
  if (!wanted.length) return true;
  return wanted.every(w => tags.some(t => t.includes(w)));
}

export function tagColorFromSeed(tag, palette){
  const colors = Array.isArray(palette) && palette.length ? palette : ['#4fc3f7'];
  const s = String(tag || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

/* ═══════════════════════════════════════════════════════════════════
   v8.0.0 — Fuzzy search + saved filters
   ═══════════════════════════════════════════════════════════════════ */

export function fuzzyScore(text, query){
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

export function normalizeSavedFilter(obj){
  if (!obj || typeof obj !== 'object') return null;
  const name = String(obj.name || '').trim().slice(0, 40);
  if (!name) return null;
  return {
    id: obj.id || ('sf_' + Date.now().toString(36)),
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