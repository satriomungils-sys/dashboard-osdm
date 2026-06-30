// =============================================================
// HALAMAN: DASHBOARD
// =============================================================
Page.dashboard = async function () {
  const res = await Api.dashboard();
  if (!res.success) { Utils.toast(res.message || "Gagal memuat dashboard", "danger"); return; }
  const d = res.data;
  const user = Auth.currentUser();

  document.getElementById("content").innerHTML = `
    <div class="panel" style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div class="panel-title" style="margin-bottom:2px;">Dashboard</div>
        <div style="color:var(--muted);font-size:13px;">Selamat datang, ${Utils.escapeHtml(user.Nama || user.Username)}</div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card blue"><div class="label">Total Pekerjaan</div><div class="value">${d.total}</div><div class="sub">Semua Pekerjaan</div></div>
      <div class="kpi-card green"><div class="label">Selesai</div><div class="value">${d.selesai}</div><div class="sub">${pct(d.selesai, d.total)}%</div></div>
      <div class="kpi-card orange"><div class="label">Dalam Proses</div><div class="value">${d.dalamProses}</div><div class="sub">${pct(d.dalamProses, d.total)}%</div></div>
      <div class="kpi-card red"><div class="label">Terlambat</div><div class="value">${d.terlambat}</div><div class="sub">${pct(d.terlambat, d.total)}%</div></div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">Progress Pekerjaan Per Bulan</div>
        <canvas id="chartBulan" height="160"></canvas>
      </div>
      <div class="panel">
        <div class="panel-title">Progress Pekerjaan Per Bidang</div>
        <canvas id="chartBidang" height="160"></canvas>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">Pekerjaan Mendekati Deadline</div>
      <table>
        <thead><tr><th>No</th><th>Pekerjaan</th><th>PIC</th><th>Deadline</th><th>Sisa Hari</th><th>Status</th></tr></thead>
        <tbody>
          ${d.mendekatiDeadline.length ? d.mendekatiDeadline.map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${Utils.escapeHtml(p["Nama Kegiatan/Pekerjaan"])}</td>
              <td>${Utils.escapeHtml(p.PIC)}</td>
              <td>${Utils.formatTanggal(p.Deadline)}</td>
              <td>${p.sisaHari < 0 ? `<span style="color:var(--red)">Terlambat ${Math.abs(p.sisaHari)} hari</span>` : p.sisaHari + " hari"}</td>
              <td><span class="${Utils.statusBadgeClass(p.Status)}">${Utils.escapeHtml(p.Status)}</span></td>
            </tr>`).join("") : `<tr><td colspan="6" style="text-align:center;color:var(--muted);">Tidak ada pekerjaan mendekati deadline</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  renderCharts(d);
};

function pct(n, total) {
  if (!total) return 0;
  return ((n / total) * 100).toFixed(2);
}

function renderCharts(d) {
  const ctx1 = document.getElementById("chartBulan");
  new Chart(ctx1, {
    type: "line",
    data: {
      labels: d.progressPerBulan.map(x => x.bulan),
      datasets: [{ label: "Progress (%)", data: d.progressPerBulan.map(x => x.progress), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,.15)", tension: .3, fill: true }]
    },
    options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { suggestedMin: 0, suggestedMax: 100 } } }
  });

  const ctx2 = document.getElementById("chartBidang");
  const labels = Object.keys(d.progressPerBidang);
  new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data: labels.map(l => d.progressPerBidang[l]), backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"] }]
    },
    options: { responsive: true, plugins: { legend: { position: "right" } } }
  });
}
