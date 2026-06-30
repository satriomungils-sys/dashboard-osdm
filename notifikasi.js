// =============================================================
// HALAMAN: NOTIFIKASI
// =============================================================
Page.notifikasi = async function () {
  const res = await Api.list("Pekerjaan");
  const data = res.data || [];
  const today = new Date(); today.setHours(0,0,0,0);

  const mendekati = data.filter(p => p.Status !== "Selesai" && Utils.sisaHari(p.Deadline) !== null && Utils.sisaHari(p.Deadline) >= 0 && Utils.sisaHari(p.Deadline) <= APP_CONFIG.deadlineWarningDays);
  const lewat = data.filter(p => p.Status !== "Selesai" && Utils.sisaHari(p.Deadline) !== null && Utils.sisaHari(p.Deadline) < 0);

  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="panel-title" style="color:var(--red);">&#9888; Pekerjaan Melewati Deadline (${lewat.length})</div>
      ${notifList(lewat, true)}
    </div>
    <div class="panel">
      <div class="panel-title" style="color:var(--orange);">&#9201; Pekerjaan Mendekati Deadline (${mendekati.length})</div>
      ${notifList(mendekati, false)}
    </div>
  `;
};

function notifList(arr, late) {
  if (!arr.length) return `<p style="color:var(--muted);font-size:13px;">Tidak ada pekerjaan.</p>`;
  return `<table><thead><tr><th>Pekerjaan</th><th>PIC</th><th>Deadline</th><th>${late ? "Terlambat" : "Sisa Hari"}</th></tr></thead><tbody>
    ${arr.map(p => `<tr><td>${Utils.escapeHtml(p["Nama Kegiatan/Pekerjaan"])}</td><td>${Utils.escapeHtml(p.PIC)}</td><td>${Utils.formatTanggal(p.Deadline)}</td>
      <td>${late ? Math.abs(Utils.sisaHari(p.Deadline)) + " hari" : Utils.sisaHari(p.Deadline) + " hari"}</td></tr>`).join("")}
  </tbody></table>`;
}

// =============================================================
// HALAMAN: AUDIT LOG
// =============================================================
Page.audit = async function () {
  const res = await Api.list("LogActivity");
  const data = (res.data || []).sort((a, b) => (Utils.parseTanggal(b.Tanggal) || 0) - (Utils.parseTanggal(a.Tanggal) || 0));
  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="panel-title">Audit Log</div>
      <table>
        <thead><tr><th>Tanggal</th><th>User</th><th>Aktivitas</th><th>Detail</th></tr></thead>
        <tbody>
          ${data.length ? data.map(l => `<tr><td>${Utils.escapeHtml(l.Tanggal)}</td><td>${Utils.escapeHtml(l.User)}</td><td>${Utils.escapeHtml(l.Aktivitas)}</td><td>${Utils.escapeHtml(l.Detail)}</td></tr>`).join("") : `<tr><td colspan="4" style="text-align:center;color:var(--muted)">Belum ada aktivitas tercatat</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
};

// =============================================================
// HALAMAN: PENGATURAN
// =============================================================
Page.pengaturan = async function () {
  const res = await Api.list("Setting");
  const data = res.data || [];
  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="panel-title">Pengaturan Aplikasi</div>
      <table>
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody>
          ${data.length ? data.map(s => `<tr><td>${Utils.escapeHtml(s.Key)}</td><td>${Utils.escapeHtml(s.Value)}</td></tr>`).join("") : `<tr><td colspan="2" style="text-align:center;color:var(--muted)">Belum ada pengaturan. Tambahkan baris Key/Value pada sheet "Setting".</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
};
