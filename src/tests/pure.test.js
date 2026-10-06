import { describe, it, expect } from 'vitest';
import {
  norm, upper, normMatch, levenshtein, stripArticles, similarity, matchConfidence,
  esSoloOrtografia, corregirCampo, isSafeImageUrl, isSafeStreamUrl, isAlbumUrl,
  detectDelimiter, parseCSV, normalizeYear, limpiarTituloParaBusqueda,
  migrateBackup, MIGRATIONS, SCHEMA_VERSION,
  computeVirtualRange, createLimiter,
  mergeCDs, MERGEABLE_FIELDS,
  chunk, qrPayload, formatLabelData, pagesNeeded,
  format, translate, formatNumberWith, formatCurrencyWith, formatDateWith, formatPercentWith,
  workspaceSlugify, generateWorkspaceId, validateWorkspaceName, workspaceColorFromSeed, isSafeWorkspaceId, WORKSPACE_COLORS,
  normalizeTag, parseTags, tagMatches, tagColorFromSeed, TAG_MAX_PER_CD, TAG_MAX_LENGTH,
  fuzzyScore, normalizeSavedFilter
} from '../src/pure.js';

/* ═══ Básicas ═══ */
describe('norm / upper / normMatch', () => {
  it('normaliza acentos y espacios', () => {
    expect(normMatch('Café  Tacuba')).toBe('cafe tacuba');
    expect(norm('AñO')).toBe('ano');
  });
  it('upper tolera null', () => {
    expect(upper(null)).toBe('');
    expect(upper(0)).toBe('0');
  });
});

describe('levenshtein / similarity / matchConfidence', () => {
  it('distancia clásica', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('', 'abc')).toBe(3);
  });
  it('similarity idénticos = 1', () => {
    expect(similarity('Pink Floyd', 'pink floyd')).toBe(1);
  });
  it('similarity bajo para distintos', () => {
    expect(similarity('Pink Floyd', 'Led Zeppelin')).toBeLessThan(0.4);
  });
  it('matchConfidence 100', () => {
    expect(matchConfidence('The Wall', 'Pink Floyd', { title: 'The Wall', artist: 'Pink Floyd' })).toBe(100);
  });
});

describe('esSoloOrtografia / corregirCampo', () => {
  it('detecta typo', () => {
    expect(esSoloOrtografia('Soda Estereo', 'Soda Stereo')).toBe(true);
    expect(esSoloOrtografia('Pink Floyd', 'Led Zeppelin')).toBe(false);
  });
  it('corrige si supera umbral', () => {
    expect(corregirCampo('THE WALL', 'The Wall', 90, true)).toBe('The Wall');
    expect(corregirCampo('THE WALL', 'The Wall', 50, true)).toBeNull();
  });
});

describe('isSafeImageUrl / isSafeStreamUrl / isAlbumUrl', () => {
  it('imágenes', () => {
    expect(isSafeImageUrl('https://x.com/a.jpg')).toBe(true);
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
  });
  it('streaming', () => {
    expect(isSafeStreamUrl('https://open.spotify.com/album/abc')).toBe(true);
    expect(isSafeStreamUrl('https://evil.com/track')).toBe(false);
  });
  it('álbumes', () => {
    expect(isAlbumUrl('https://open.spotify.com/album/abc', 'spotify')).toBe(true);
    expect(isAlbumUrl('https://open.spotify.com/track/abc', 'spotify')).toBe(false);
  });
});

describe('parseCSV / normalizeYear / limpiarTitulo', () => {
  it('CSV con comillas', () => {
    const rows = parseCSV('a;b\n"con ""comillas""";x\n');
    expect(rows[1][0]).toBe('con "comillas"');
  });
  it('normalizeYear valida rango', () => {
    expect(normalizeYear('1969')).toBe(1969);
    expect(normalizeYear('1850')).toBeNull();
  });
  it('limpiarTituloParaBusqueda', () => {
    expect(limpiarTituloParaBusqueda('Album (Live)')).toBe('Album');
    expect(limpiarTituloParaBusqueda('Album CD 2')).toBe('Album');
  });
});

/* ═══ Migraciones ═══ */
describe('migrateBackup', () => {
  it('null → null', () => {
    expect(migrateBackup(null, 1).data).toBeNull();
  });
  it('no migra si ya está al día', () => {
    const { applied } = migrateBackup({ version: SCHEMA_VERSION, categories: {} }, SCHEMA_VERSION, MIGRATIONS);
    expect(applied.length).toBe(0);
  });
  it('aplica v1 completa', () => {
    const { data, applied } = migrateBackup({ version: 1, categories: [{ label: 'X', cds: [] }] }, 1, MIGRATIONS);
    expect(applied.length).toBe(3);
    expect(data.version).toBe(SCHEMA_VERSION);
  });
  it('maneja migraciones rotas', () => {
    const bad = [{ from: 1, to: 2, name: 'rota', fn: () => { throw new Error('x'); } }];
    const { applied } = migrateBackup({ version: 1, categories: {} }, 1, bad);
    expect(applied.length).toBe(0);
  });
});

/* ═══ Virtual ═══ */
describe('computeVirtualRange', () => {
  it('total 0 → vacío', () => { expect(computeVirtualRange(0, 70, 700, 0, 6).end).toBe(0); });
  it('sin scroll', () => {
    const r = computeVirtualRange(100, 70, 700, 0, 6);
    expect(r.start).toBe(0);
    expect(r.end).toBe(16);
  });
  it('mitad', () => {
    const r = computeVirtualRange(100, 70, 700, 3500, 6);
    expect(r.start).toBe(44);
    expect(r.end).toBe(66);
  });
  it('invariante de altura', () => {
    const r = computeVirtualRange(250, 60, 800, 4200, 6);
    const rendered = (r.end - r.start) * 60;
    expect(r.topPad + rendered + r.bottomPad).toBe(250 * 60);
  });
});

/* ═══ Limiter ═══ */
describe('createLimiter', () => {
  it('respeta concurrencia', async () => {
    const limit = createLimiter(2);
    let active = 0, maxActive = 0;
    await Promise.all(Array.from({ length: 10 }, () => limit(async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise(r => setTimeout(r, 5));
      active--;
    })));
    expect(maxActive).toBeLessThanOrEqual(2);
  });
  it('propaga errores', async () => {
    const limit = createLimiter(2);
    const res = await Promise.allSettled([
      limit(() => Promise.resolve('ok')),
      limit(() => Promise.reject(new Error('boom')))
    ]);
    expect(res[0].status).toBe('fulfilled');
    expect(res[1].status).toBe('rejected');
  });
});

/* ═══ Merge ═══ */
describe('mergeCDs', () => {
  it('null y null → null', () => { expect(mergeCDs(null, null)).toBeNull(); });
  it('permite elegir de b', () => {
    const a = { id: 'a1', titulo: 'A', interprete: 'X', anio: 1990 };
    const b = { id: 'b1', titulo: 'B', interprete: 'Y', anio: 2000 };
    const r = mergeCDs(a, b, { titulo: 'b', anio: 'b' });
    expect(r.titulo).toBe('B');
    expect(r.interprete).toBe('X');
  });
  it('conserva id y nro', () => {
    const r = mergeCDs({ id: 'a1', nro: 10 }, { id: 'b1', nro: 20 });
    expect(r.id).toBe('a1');
    expect(r.nro).toBe(10);
  });
  it('une links con preferencia a a', () => {
    const a = { id: 'a1', links: { spotify: 'A' } };
    const b = { id: 'b1', links: { spotify: 'B', apple: 'C' } };
    const r = mergeCDs(a, b);
    expect(r.links.spotify).toBe('A');
    expect(r.links.apple).toBe('C');
  });
  it('une tags', () => {
    const r = mergeCDs({ id: 'a1', tags: ['rock'] }, { id: 'b1', tags: ['pop', 'rock'] });
    expect(r.tags).toEqual(['rock', 'pop']);
  });
  it('MERGEABLE_FIELDS contiene clave', () => {
    const keys = MERGEABLE_FIELDS.map(f => f.key);
    expect(keys).toContain('titulo');
    expect(keys).not.toContain('id');
  });
});

/* ═══ Labels ═══ */
describe('chunk / qrPayload / formatLabelData / pagesNeeded', () => {
  it('chunk divide', () => { expect(chunk([1,2,3,4], 2)).toEqual([[1,2],[3,4]]); });
  it('chunk null', () => { expect(chunk(null, 5)).toEqual([]); });
  it('qrPayload URL', () => {
    const p = qrPayload({ id: 'abc', nro: 42 }, 'url', 'http://x.com/');
    expect(p).toContain('#open?');
    expect(p).toContain('cd=abc');
  });
  it('qrPayload texto', () => {
    const p = qrPayload({ titulo: 'X', interprete: 'Y' }, 'text');
    expect(p).toContain('Título: X');
  });
  it('formatLabelData', () => {
    const r = formatLabelData({ titulo: 'X', interprete: 'A', anio: 1990 }, { interprete: true, anio: true });
    expect(r.lines[0]).toBe('A · 1990');
  });
  it('pagesNeeded', () => { expect(pagesNeeded(25, { cols: 3, rows: 8 })).toBe(2); });
});

/* ═══ i18n ═══ */
describe('format / translate', () => {
  it('format simple', () => { expect(format('Hola {name}', { name: 'Juan' })).toBe('Hola Juan'); });
  it('format deja placeholder', () => { expect(format('Hola {x}', {})).toBe('Hola {x}'); });
  it('translate directo', () => {
    expect(translate({ es: { hello: 'Hola' }, en: { hello: 'Hello' } }, 'en', 'hello')).toBe('Hello');
  });
  it('translate fallback a español', () => {
    expect(translate({ es: { x: 'Hola' }, en: {} }, 'en', 'x')).toBe('Hola');
  });
  it('translate fallback a la key', () => {
    expect(translate({ es: {} }, 'en', 'nope')).toBe('nope');
  });
});

/* ═══ Intl ═══ */
describe('formatNumberWith / formatCurrencyWith / formatDateWith / formatPercentWith', () => {
  it('en-US usa coma de miles', () => {
    expect(formatNumberWith(1234.5, 'en-US', 1)).toBe('1,234.5');
  });
  it('NaN → —', () => { expect(formatNumberWith(NaN, 'en-US')).toBe('—'); });
  it('currency USD', () => {
    const s = formatCurrencyWith(1234, 'USD', 'en-US');
    expect(s).toContain('1,234');
  });
  it('date 2024', () => {
    const s = formatDateWith(new Date('2024-06-15'), 'en-US');
    expect(s).toContain('2024');
  });
  it('date null → vacío', () => { expect(formatDateWith(null)).toBe(''); });
  it('percent 0.5', () => {
    const s = formatPercentWith(0.5, 'en-US');
    expect(s).toContain('50');
  });
});

/* ═══ Workspaces ═══ */
describe('workspace helpers', () => {
  it('slugify', () => {
    expect(workspaceSlugify('Mi Colección')).toBe('mi_coleccion');
    expect(workspaceSlugify('Jazz & Blues')).toBe('jazz_blues');
  });
  it('generateWorkspaceId', () => {
    expect(generateWorkspaceId('Rock', [])).toBe('rock');
    expect(generateWorkspaceId('Rock', [{ id: 'rock' }])).toBe('rock_2');
  });
  it('validateWorkspaceName', () => {
    expect(validateWorkspaceName('').error).toBe('name_empty');
    expect(validateWorkspaceName('Rock', [{ id: 'x', name: 'rock' }]).error).toBe('name_duplicated');
    expect(validateWorkspaceName('Jazz', []).ok).toBe(true);
  });
  it('color determinístico', () => {
    expect(workspaceColorFromSeed('rock')).toBe(workspaceColorFromSeed('rock'));
    expect(WORKSPACE_COLORS).toContain(workspaceColorFromSeed('abc'));
  });
  it('isSafeWorkspaceId', () => {
    expect(isSafeWorkspaceId('rock')).toBe(true);
    expect(isSafeWorkspaceId('Rock')).toBe(false);
  });
});

/* ═══ Tags ═══ */
describe('tags helpers', () => {
  it('normalizeTag', () => {
    expect(normalizeTag('ROCK')).toBe('rock');
    expect(normalizeTag('Música')).toBe('musica');
    expect(normalizeTag('para vender')).toBe('para_vender');
    expect(normalizeTag('a___b')).toBe('a_b');
    expect(normalizeTag('a'.repeat(50)).length).toBe(TAG_MAX_LENGTH);
  });
  it('parseTags', () => {
    expect(parseTags('rock,pop')).toEqual(['rock','pop']);
    expect(parseTags('Rock, POP Música')).toEqual(['rock','pop_musica']);
    expect(parseTags('rock,rock,pop')).toEqual(['rock','pop']);
  });
  it('tagMatches', () => {
    expect(tagMatches(['rock'], 'rock')).toBe(true);
    expect(tagMatches(['rock_nacional'], 'rock')).toBe(true);
    expect(tagMatches(['rock'], 'rock pop')).toBe(false);
    expect(tagMatches(['rock','pop'], 'rock pop')).toBe(true);
  });
  it('tagColorFromSeed', () => {
    const pal = ['#aaa','#bbb'];
    expect(pal).toContain(tagColorFromSeed('abc', pal));
  });
});

/* ═══ Fuzzy + saved filters ═══ */
describe('fuzzyScore', () => {
  it('exacto → 1000', () => { expect(fuzzyScore('Nuevo CD', 'nuevo cd')).toBe(1000); });
  it('startsWith → 500', () => { expect(fuzzyScore('Nuevo CD', 'nuevo')).toBe(500); });
  it('includes → 250', () => { expect(fuzzyScore('Exportar CSV', 'csv')).toBe(250); });
  it('sin match → -1', () => { expect(fuzzyScore('Dashboard', 'xyz')).toBe(-1); });
  it('vacío → 0', () => { expect(fuzzyScore('X', '')).toBe(0); });
});

describe('normalizeSavedFilter', () => {
  it('nombre vacío → null', () => { expect(normalizeSavedFilter({ name: '' })).toBeNull(); });
  it('null → null', () => { expect(normalizeSavedFilter(null)).toBeNull(); });
  it('genera id', () => { expect(normalizeSavedFilter({ name: 'x' }).id).toBeTruthy(); });
  it('recorta nombre a 40', () => { expect(normalizeSavedFilter({ name: 'a'.repeat(60) }).name.length).toBe(40); });
});