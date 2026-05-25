/* ==========================================================
   Storage layer — local-first
   - Por defecto guarda en localStorage del navegador (iPad)
   - Si Supabase está configurado, ADEMÁS hace push en background
     (no bloquea la UX; si falla el guardado remoto, el local sigue)
   - El admin lee de local por defecto
   ========================================================== */

const Storage = (() => {
  const STORAGE_KEY = 'suzuki_quiz_participants_v1';

  // ---------- Supabase opcional ----------
  let supabaseClient = null;
  if (typeof SUPABASE_CONFIGURED !== 'undefined' && SUPABASE_CONFIGURED && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // ---------- helpers ----------
  function readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[Storage] Error leyendo localStorage:', e);
      return [];
    }
  }

  function writeAll(rows) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
      return true;
    } catch (e) {
      console.error('[Storage] Error escribiendo localStorage:', e);
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  // ---------- API pública ----------
  async function save(record) {
    const row = {
      id:          uid(),
      name:        record.name,
      email:       record.email,
      result:      record.result,
      result_name: record.result_name,
      answers:     record.answers,
      started_at:  record.started_at,
      finished_at: record.finished_at || new Date().toISOString(),
      synced:      false
    };

    const rows = readAll();
    rows.unshift(row);
    writeAll(rows);
    console.log('[Storage] Guardado local. Total:', rows.length);

    // intenta push remoto en background (no bloquea)
    if (supabaseClient) {
      pushRemote(row).catch(err => console.warn('[Storage] Push remoto falló:', err));
    }

    return row;
  }

  async function pushRemote(row) {
    if (!supabaseClient) return;
    const payload = {
      name:        row.name,
      email:       row.email,
      result:      row.result,
      result_name: row.result_name,
      answers:     row.answers,
      started_at:  row.started_at,
      finished_at: row.finished_at
    };
    const { error } = await supabaseClient.from('participants').insert(payload);
    if (error) throw error;

    // marca como sincronizado
    const rows = readAll();
    const idx = rows.findIndex(r => r.id === row.id);
    if (idx !== -1) {
      rows[idx].synced = true;
      writeAll(rows);
    }
  }

  /**
   * Re-intenta enviar a Supabase todos los registros pendientes.
   * Útil cuando recuperas WiFi después del evento.
   */
  async function syncPending() {
    if (!supabaseClient) return { ok: 0, fail: 0, skipped: 'no-supabase' };
    const rows = readAll();
    const pending = rows.filter(r => !r.synced);
    let ok = 0, fail = 0;
    for (const row of pending) {
      try { await pushRemote(row); ok++; } catch (e) { fail++; }
    }
    return { ok, fail, total: pending.length };
  }

  function list() {
    return readAll();
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function remove(id) {
    const rows = readAll().filter(r => r.id !== id);
    writeAll(rows);
  }

  return { save, list, clear, remove, syncPending, hasRemote: !!supabaseClient };
})();
