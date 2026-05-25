/* ==========================================================
   Admin dashboard — lectura local (localStorage del iPad)
   - Por defecto: muestra registros guardados en ESTE dispositivo
   - Si Supabase está configurado: botón para sincronizar pendientes
   - Botón para borrar todos los datos (después del evento)
   ========================================================== */

(() => {
  'use strict';

  const $ = sel => document.querySelector(sel);
  let allRows = [];

  function load() {
    allRows = Storage.list();
    render();
    updateBadge();
  }

  function updateBadge() {
    const badge = $('#source-badge');
    if (!badge) return;
    const pending = allRows.filter(r => r.synced === false).length;
    if (Storage.hasRemote) {
      badge.textContent = pending ? `${pending} pendiente(s) por sincronizar` : 'Sincronizado con Supabase';
      badge.className = 'source-badge ' + (pending ? 'is-pending' : 'is-synced');
    } else {
      badge.textContent = 'Modo local (sin servidor)';
      badge.className = 'source-badge is-local';
    }
  }

  function render() {
    const search = $('#search').value.toLowerCase().trim();
    const filter = $('#filter-result').value;

    const rows = allRows.filter(r => {
      if (filter && r.result !== filter) return false;
      if (search) {
        const hay = `${r.name || ''} ${r.email || ''} ${r.phone || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    renderStats(allRows);
    renderRows(rows);
  }

  function renderStats(rows) {
    const total  = rows.length;
    const counts = { swift: 0, dzire: 0, jimny: 0 };
    rows.forEach(r => { if (counts[r.result] !== undefined) counts[r.result]++; });

    const pct = n => total ? Math.round((n / total) * 100) + '%' : '—';

    $('#stats').innerHTML = `
      <div class="stat">
        <div class="stat__label">Total</div>
        <div class="stat__value">${total}</div>
        <div class="stat__pct">participantes</div>
      </div>
      <div class="stat stat--swift">
        <div class="stat__label">Swift</div>
        <div class="stat__value">${counts.swift}</div>
        <div class="stat__pct">${pct(counts.swift)}</div>
      </div>
      <div class="stat stat--dzire">
        <div class="stat__label">Dzire</div>
        <div class="stat__value">${counts.dzire}</div>
        <div class="stat__pct">${pct(counts.dzire)}</div>
      </div>
      <div class="stat stat--jimny">
        <div class="stat__label">Jimny</div>
        <div class="stat__value">${counts.jimny}</div>
        <div class="stat__pct">${pct(counts.jimny)}</div>
      </div>
    `;
  }

  function renderRows(rows) {
    if (rows.length === 0) {
      $('#rows').innerHTML = '<tr><td colspan="7" class="empty">Sin registros todavía</td></tr>';
      return;
    }

    $('#rows').innerHTML = rows.map((r, i) => {
      const answers = Array.isArray(r.answers) ? r.answers : [];
      const mini = answers.map(a => `<span class="a-${a}" title="${a}">${a.charAt(0).toUpperCase()}</span>`).join('');
      const date = r.finished_at ? new Date(r.finished_at).toLocaleString('es-MX') : '—';
      const syncDot = Storage.hasRemote
        ? `<span class="sync-dot ${r.synced ? 'is-ok' : 'is-pending'}" title="${r.synced ? 'sincronizado' : 'pendiente'}"></span>`
        : '';
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(r.name || '—')}</td>
          <td>${escapeHtml(r.email || '—')}</td>
          <td>${escapeHtml(r.phone || '—')}</td>
          <td>${syncDot}<span class="badge badge--${r.result}">${r.result_name || r.result || '—'}</span></td>
          <td><div class="answers-mini">${mini}</div></td>
          <td>${date}</td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ---------- Export ----------
  function exportCSV() {
    if (!allRows.length) { alert('No hay registros para exportar.'); return; }
    const headers = ['Nombre', 'Correo', 'Teléfono', 'Resultado', 'Respuestas', 'Iniciado', 'Finalizado'];
    const lines = [headers.join(',')];
    allRows.forEach(r => {
      const ans = Array.isArray(r.answers) ? r.answers.join('|') : '';
      const row = [
        csvCell(r.name),
        csvCell(r.email),
        csvCell(r.phone),
        csvCell(r.result_name || r.result),
        csvCell(ans),
        csvCell(r.started_at),
        csvCell(r.finished_at)
      ];
      lines.push(row.join(','));
    });
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    download(blob, `suzuki-quiz-${new Date().toISOString().slice(0,10)}.csv`);
  }

  function exportJSON() {
    if (!allRows.length) { alert('No hay registros para exportar.'); return; }
    const blob = new Blob([JSON.stringify(allRows, null, 2)], { type: 'application/json' });
    download(blob, `suzuki-quiz-${new Date().toISOString().slice(0,10)}.json`);
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function csvCell(v) {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  }

  // ---------- Clear all ----------
  function clearAll() {
    const n = allRows.length;
    if (n === 0) { alert('Ya no hay registros.'); return; }
    const ok = confirm(`¿Borrar TODOS los ${n} registros de este iPad?\n\nEsta acción NO se puede deshacer. Asegúrate de haber exportado el CSV antes.`);
    if (!ok) return;
    const ok2 = confirm('Confirmación final: ¿seguro que quieres borrar todo?');
    if (!ok2) return;
    Storage.clear();
    load();
  }

  // ---------- Sync ----------
  async function syncNow() {
    if (!Storage.hasRemote) {
      alert('Supabase no está configurado. Esta función sólo aplica si conectas un servidor remoto.');
      return;
    }
    const btn = $('#sync-now');
    btn.disabled = true;
    btn.textContent = 'Sincronizando…';
    const res = await Storage.syncPending();
    btn.disabled = false;
    btn.textContent = 'Sincronizar';
    load();
    alert(`Sincronización terminada.\nEnviados: ${res.ok}\nFallidos: ${res.fail}`);
  }

  // ---------- listeners ----------
  $('#refresh').addEventListener('click', load);
  $('#search').addEventListener('input', render);
  $('#filter-result').addEventListener('change', render);
  $('#export-csv').addEventListener('click', exportCSV);
  $('#export-json')?.addEventListener('click', exportJSON);
  $('#clear-all')?.addEventListener('click', clearAll);
  $('#sync-now')?.addEventListener('click', syncNow);

  // ---------- auto-refresh cada 4s para ver registros nuevos
  // (cuando se hace en el mismo iPad y se cambian pestañas)
  setInterval(load, 4000);

  load();
})();
