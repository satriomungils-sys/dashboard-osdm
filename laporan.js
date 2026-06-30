// =============================================================
// HALAMAN: LAPORAN PEKERJAAN
// =============================================================
Page.laporan = async function () {
  const [pekerjaanRes, strukturRes] = await Promise.all([Api.list("Pekerjaan"), Api.list("Struktur Organisasi")]);
  Page._laporanData = pekerjaanRes.data || [];
  const pegawai = strukturRes.data || [];
  const bidangList = [...new Set(pegawai.map(p => p.Bidang).filter(Boolean))];
  const picList = [...new Set(Page._laporanData.map(p => p.PIC).filter(Boolean))];
  const statusList = [...new Set(Page._laporanData.map(p => p.Status).filter(Boolean))];

  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <div class="filters">
          <input type="date" id="lf-dari">
          <input type="date" id="lf-sampai">
          <select id="lf-bidang"><option value="">Semua Bidang</option>${bidangList.map(b => `<option>${Utils.escapeHtml(b)}</option>`).join("")}</select>
          <select id="lf-pic"><option value="">Semua PIC</option>${picList.map(p => `<option>${Utils.escapeHtml(p)}</option>`).join("")}</select>
          <select id="lf-status"><option value="">Semua Status</option>${statusList.map(s => `<option>${Utils.escapeHtml(s)}</option>`).join("")}</select>
          <button class="btn btn-primary btn-sm" id="btn-tampilkan">Tampilkan</button>
        </div>
        <div class="filters">
          <button class="btn btn-success btn-sm" id="btn-excel">&#128190; Export Excel</button>
          <button class="btn btn-danger btn-sm" id="btn-pdf">&#128196; Export PDF</button>
          <button class="btn btn-outline btn-sm" id="btn-cetak">&#128424; Cetak</button>
        </div>
      </div>
      <div id="laporan-table"></div>
    </div>
  `;

  const filterFn = () => Page._laporanData.filter(p => {
    const tgl = Utils.parseTanggal(p.Tanggal);
    const dari = document.getElementById("lf-dari").value ? new Date(document.getElementById("lf-dari").value) : null;
    const sampai = document.getElementById("lf-sampai").value ? new Date(document.getElementById("lf-sampai").value) : null;
    const bidang = document.getElementById("lf-bidang").value;
    const pic = document.getElementById("lf-pic").value;
    const status = document.getElementById("lf-status").value;
    const picBidang = pegawai.find(x => x.Nama === p.PIC);
    if (dari && tgl && tgl < dari) return false;
    if (sampai && tgl && tgl > sampai) return false;
    if (bidang && (!picBidang || picBidang.Bidang !== bidang)) return false;
    if (pic && p.PIC !== pic) return false;
    if (status && p.Status !== status) return false;
    return true;
  });

  const renderLaporan = () => {
    const data = filterFn();
    const avg = data.length ? (data.reduce((s, p) => s + (Number(p["Progres (%)"]) || 0), 0) / data.length).toFixed(2) : 0;
    Page._laporanFiltered = data;
    document.getElementById("laporan-table").innerHTML = `
      <table id="tabel-cetak">
        <thead><tr><th>No</th><th>Kode</th><th>Pekerjaan</th><th>Bidang</th><th>PIC</th><th>Status</th><th>Progress</th><th>Deadline</th></tr></thead>
        <tbody>
          ${data.map((p, i) => {
            const b = pegawai.find(x => x.Nama === p.PIC);
            return `<tr><td>${i + 1}</td><td>PKJ-${String(p.ID).padStart(3, "0")}</td><td>${Utils.escapeHtml(p["Nama Kegiatan/Pekerjaan"])}</td>
              <td>${Utils.escapeHtml(b ? b.Bidang : "-")}</td><td>${Utils.escapeHtml(p.PIC)}</td>
              <td><span class="${Utils.statusBadgeClass(p.Status)}">${Utils.escapeHtml(p.Status || "-")}</span></td>
              <td>${p["Progres (%)"] || 0}%</td><td>${Utils.formatTanggal(p.Deadline)}</td></tr>`;
          }).join("") || `<tr><td colspan="8" style="text-align:center;color:var(--muted)">Tidak ada data</td></tr>`}
        </tbody>
        <tfoot><tr><td colspan="6" style="text-align:right;font-weight:700;">TOTAL ${data.length} | Rata-rata Progress</td><td colspan="2" style="font-weight:700;">${avg}%</td></tr></tfoot>
      </table>
    `;
  };

  document.getElementById("btn-tampilkan").onclick = renderLaporan;
  document.getElementById("btn-cetak").onclick = () => window.print();
  document.getElementById("btn-excel").onclick = () => exportExcel(Page._laporanFiltered || []);
  document.getElementById("btn-pdf").onclick = () => window.print();

  renderLaporan();
};

function exportExcel(data) {
  const headers = ["No", "Kode", "Pekerjaan", "PIC", "Status", "Progress (%)", "Deadline"];
  const rows = data.map((p, i) => [i + 1, "PKJ-" + String(p.ID).padStart(3, "0"), p["Nama Kegiatan/Pekerjaan"], p.PIC, p.Status, p["Progres (%)"], Utils.formatTanggal(p.Deadline)]);
  let csv = headers.join(",") + "\n" + rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Laporan-Pekerjaan.csv";
  a.click();
}
