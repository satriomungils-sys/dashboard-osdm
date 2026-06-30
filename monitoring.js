// =============================================================
// HALAMAN: DASHBOARD MONITORING (KPI lengkap dengan filter)
// =============================================================
Page.monitoring = async function () {
  const [pekerjaanRes, strukturRes] = await Promise.all([Api.list("Pekerjaan"), Api.list("Struktur Organisasi")]);
  const data = pekerjaanRes.data || [];
  const pegawai = strukturRes.data || [];
  const picToBidang = {};
  pegawai.forEach(p => picToBidang[p.Nama] = p.Bidang);
  const bidangList = [...new Set(pegawai.map(p => p.Bidang).filter(Boolean))];
  const picList = [...new Set(data.map(p => p.PIC).filter(Boolean))];

  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <div class="filters">
          <select id="mf-bidang"><option value="">Semua Bidang</option>${bidangList.map(b => `<option>${Utils.escapeHtml(b)}</option>`).join("")}</select>
          <select id="mf-pic"><option value="">Semua PIC</option>${picList.map(p => `<option>${Utils.escapeHtml(p)}</option>`).join("")}</select>
          <select id="mf-status"><option value="">Semua Status</option>${[...new Set(data.map(p => p.Status))].map(s => `<option>${Utils.escapeHtml(s)}</option>`).join("")}</select>
        </div>
      </div>
    </div>
    <div id="monitoring-body"></div>
  `;

  const update = () => renderMonitoring(data, picToBidang, {
    bidang: document.getElementById("mf-bidang").value,
    pic: document.getElementById("mf-pic").value,
    status: document.getElementById("mf-status").value
  });
  document.getElementById("mf-bidang").onchange = update;
  document.getElementById("mf-pic").onchange = update;
  document.getElementById("mf-status").onchange = update;
  update();
};

function renderMonitoring(data, picToBidang, filter) {
  const filtered = data.filter(p =>
    (!filter.bidang || picToBidang[p.PIC] === filter.bidang) &&
    (!filter.pic || p.PIC === filter.pic) &&
    (!filter.status || p.Status === filter.status)
  );
  const total = filtered.length;
  const selesai = filtered.filter(p => p.Status === "Selesai").length;
  const terlambat = filtered.filter(p => p.Status === "Terlambat").length;
  const avgProgress = total ? Math.round(filtered.reduce((s, p) => s + (Number(p["Progres (%)"]) || 0), 0) / total) : 0;

  const perPic = {};
  filtered.forEach(p => { perPic[p.PIC] = perPic[p.PIC] || { total: 0, selesai: 0 }; perPic[p.PIC].total++; if (p.Status === "Selesai") perPic[p.PIC].selesai++; });

  document.getElementById("monitoring-body").innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card blue"><div class="label">Total Pekerjaan</div><div class="value">${total}</div></div>
      <div class="kpi-card green"><div class="label">Selesai</div><div class="value">${selesai}</div></div>
      <div class="kpi-card orange"><div class="label">Rata-rata Progress</div><div class="value">${avgProgress}%</div></div>
      <div class="kpi-card red"><div class="label">Terlambat</div><div class="value">${terlambat}</div></div>
    </div>
    <div class="panel">
      <div class="panel-title">Kinerja per PIC</div>
      <table>
        <thead><tr><th>PIC</th><th>Total Pekerjaan</th><th>Selesai</th><th>% Penyelesaian</th></tr></thead>
        <tbody>
          ${Object.entries(perPic).map(([pic, v]) => `
            <tr><td>${Utils.escapeHtml(pic)}</td><td>${v.total}</td><td>${v.selesai}</td>
            <td><div class="progress-bar-track" style="max-width:160px;"><div class="progress-bar-fill" style="width:${Math.round(v.selesai / v.total * 100)}%"></div></div></td></tr>
          `).join("") || `<tr><td colspan="4" style="text-align:center;color:var(--muted)">Tidak ada data</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}
