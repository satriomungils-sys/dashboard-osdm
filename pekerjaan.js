// =============================================================
// HALAMAN: DATA PEKERJAAN
// =============================================================
Page._pekerjaanState = { page: 1, pageSize: 10, search: "", status: "", prioritas: "" };

Page.pekerjaan = async function () {
  const [pekerjaan, statusList, prioritasList, struktur] = await Promise.all([
    Api.list("Pekerjaan"), Api.list("MasterStatus"), Api.list("MasterPrioritas"), Api.list("Struktur Organisasi")
  ]);
  Page._pekerjaanData = pekerjaan.data || [];
  Page._statusList = statusList.data || [];
  Page._prioritasList = prioritasList.data || [];
  Page._pegawaiList = struktur.data || [];

  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <div class="filters">
          <input id="f-search" placeholder="Cari pekerjaan..." />
          <select id="f-status"><option value="">Semua Status</option>${Page._statusList.map(s => `<option>${Utils.escapeHtml(s["Nama Status"] || s["Status"])}</option>`).join("")}</select>
          <select id="f-prioritas"><option value="">Semua Prioritas</option>${Page._prioritasList.map(p => `<option>${Utils.escapeHtml(p["Nama Prioritas"] || p["Prioritas"])}</option>`).join("")}</select>
        </div>
        <button class="btn btn-primary" id="btn-tambah">+ Tambah Pekerjaan</button>
      </div>
      <div id="pekerjaan-table"></div>
    </div>
  `;

  document.getElementById("f-search").oninput = (e) => { Page._pekerjaanState.search = e.target.value; Page._pekerjaanState.page = 1; renderTable(); };
  document.getElementById("f-status").onchange = (e) => { Page._pekerjaanState.status = e.target.value; Page._pekerjaanState.page = 1; renderTable(); };
  document.getElementById("f-prioritas").onchange = (e) => { Page._pekerjaanState.prioritas = e.target.value; Page._pekerjaanState.page = 1; renderTable(); };
  document.getElementById("btn-tambah").onclick = () => openForm();

  renderTable();
};

function filteredData() {
  const st = Page._pekerjaanState;
  return Page._pekerjaanData.filter(p => {
    const matchSearch = !st.search || (p["Nama Kegiatan/Pekerjaan"] || "").toLowerCase().includes(st.search.toLowerCase());
    const matchStatus = !st.status || p.Status === st.status;
    const matchPrioritas = !st.prioritas || p.Prioritas === st.prioritas;
    return matchSearch && matchStatus && matchPrioritas;
  });
}

function renderTable() {
  const st = Page._pekerjaanState;
  const data = filteredData();
  const totalPages = Math.max(1, Math.ceil(data.length / st.pageSize));
  st.page = Math.min(st.page, totalPages);
  const pageData = data.slice((st.page - 1) * st.pageSize, st.page * st.pageSize);

  document.getElementById("pekerjaan-table").innerHTML = `
    <table>
      <thead><tr><th>No</th><th>Kode</th><th>Pekerjaan</th><th>PIC</th><th>Prioritas</th><th>Status</th><th>Progress</th><th>Deadline</th><th>Aksi</th></tr></thead>
      <tbody>
        ${pageData.length ? pageData.map((p, i) => `
          <tr>
            <td>${(st.page - 1) * st.pageSize + i + 1}</td>
            <td>PKJ-${String(p.ID).padStart(3, "0")}</td>
            <td>${Utils.escapeHtml(p["Nama Kegiatan/Pekerjaan"])}</td>
            <td>${Utils.escapeHtml(p.PIC)}</td>
            <td><span class="${Utils.prioritasBadgeClass(p.Prioritas)}">${Utils.escapeHtml(p.Prioritas || "-")}</span></td>
            <td><span class="${Utils.statusBadgeClass(p.Status)}">${Utils.escapeHtml(p.Status || "-")}</span></td>
            <td style="min-width:120px;">
              <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${p["Progres (%)"] || 0}%"></div></div>
              <div style="font-size:11px;color:var(--muted);margin-top:3px;">${p["Progres (%)"] || 0}%</div>
            </td>
            <td>${Utils.formatTanggal(p.Deadline)}</td>
            <td>
              <button class="icon-btn view" title="Detail" onclick="Router.go('pekerjaan-detail','${p.ID}')">&#128065;</button>
              <button class="icon-btn edit" title="Ubah" onclick="Page._editPekerjaan('${p.ID}')">&#9998;</button>
              <button class="icon-btn del" title="Hapus" onclick="Page._delPekerjaan('${p.ID}')">&#128465;</button>
            </td>
          </tr>`).join("") : `<tr><td colspan="9" style="text-align:center;color:var(--muted);">Tidak ada data</td></tr>`}
      </tbody>
    </table>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
      <span style="font-size:12px;color:var(--muted);">Menampilkan ${data.length ? (st.page - 1) * st.pageSize + 1 : 0} - ${Math.min(st.page * st.pageSize, data.length)} dari ${data.length} data</span>
      <div class="pagination">
        <button ${st.page === 1 ? "disabled" : ""} onclick="Page._gotoPage(${st.page - 1})">&lt;</button>
        ${Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(n => `<button class="${n === st.page ? "active" : ""}" onclick="Page._gotoPage(${n})">${n}</button>`).join("")}
        <button ${st.page === totalPages ? "disabled" : ""} onclick="Page._gotoPage(${st.page + 1})">&gt;</button>
      </div>
    </div>
  `;
}

Page._gotoPage = (n) => { Page._pekerjaanState.page = n; renderTable(); };

Page._editPekerjaan = (id) => {
  const item = Page._pekerjaanData.find(p => String(p.ID) === String(id));
  openForm(item);
};

Page._delPekerjaan = async (id) => {
  if (!Utils.confirmDialog("Hapus pekerjaan ini? Tindakan tidak dapat dibatalkan.")) return;
  const res = await Api.remove("Pekerjaan", id);
  if (res.success) { Utils.toast("Pekerjaan berhasil dihapus", "success"); Page.pekerjaan(); }
  else Utils.toast(res.message || "Gagal menghapus", "danger");
};

function openForm(item) {
  const isEdit = !!item;
  const pegawai = Page._pegawaiList;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>${isEdit ? "Ubah" : "Tambah"} Pekerjaan</h3>
      <form id="form-pekerjaan">
        <div class="form-row"><label>Nama Kegiatan/Pekerjaan</label><input name="Nama Kegiatan/Pekerjaan" required value="${item ? Utils.escapeHtml(item["Nama Kegiatan/Pekerjaan"]) : ""}"></div>
        <div class="form-grid">
          <div class="form-row"><label>PIC</label>
            <select name="PIC" required>${pegawai.map(p => `<option ${item && item.PIC === p.Nama ? "selected" : ""}>${Utils.escapeHtml(p.Nama)}</option>`).join("")}</select>
          </div>
          <div class="form-row"><label>Prioritas</label>
            <select name="Prioritas" required>${Page._prioritasList.map(p => { const v = p["Nama Prioritas"] || p["Prioritas"]; return `<option ${item && item.Prioritas === v ? "selected" : ""}>${Utils.escapeHtml(v)}</option>`; }).join("")}</select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label>Status</label>
            <select name="Status" required>${Page._statusList.map(s => { const v = s["Nama Status"] || s["Status"]; return `<option ${item && item.Status === v ? "selected" : ""}>${Utils.escapeHtml(v)}</option>`; }).join("")}</select>
          </div>
          <div class="form-row"><label>Progres (%)</label><input type="number" min="0" max="100" name="Progres (%)" value="${item ? item["Progres (%)"] : 0}"></div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label>Tanggal</label><input type="date" name="Tanggal" value="${toInputDate(item && item.Tanggal)}"></div>
          <div class="form-row"><label>Deadline</label><input type="date" name="Deadline" required value="${toInputDate(item && item.Deadline)}"></div>
        </div>
        <div class="form-row"><label>Kendala</label><textarea name="Kendala" rows="2">${item ? Utils.escapeHtml(item.Kendala || "") : ""}</textarea></div>
        <div class="form-row"><label>Tindak Lanjut</label><textarea name="Tindak Lanjut" rows="2">${item ? Utils.escapeHtml(item["Tindak Lanjut"] || "") : ""}</textarea></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="btn-cancel">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#btn-cancel").onclick = () => overlay.remove();
  overlay.querySelector("#form-pekerjaan").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data["Tanggal"] = fromInputDate(data["Tanggal"]);
    data["Deadline"] = fromInputDate(data["Deadline"]);
    data["Triwulan"] = triwulanFromDate(data["Tanggal"]);
    data["Bulan"] = bulanFromDate(data["Tanggal"]);

    const res = isEdit ? await Api.update("Pekerjaan", item.ID, data) : await Api.create("Pekerjaan", data);
    if (res.success) {
      Utils.toast("Data berhasil disimpan", "success");
      overlay.remove();
      Page.pekerjaan();
    } else {
      Utils.toast(res.message || "Gagal menyimpan", "danger");
    }
  };
}

function toInputDate(v) {
  const d = Utils.parseTanggal(v);
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}
function fromInputDate(v) {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}
function triwulanFromDate(v) {
  const d = Utils.parseTanggal(v);
  if (!d) return "";
  const q = Math.floor(d.getMonth() / 3) + 1;
  const roman = ["I", "II", "III", "IV"][q - 1];
  return `Triwulan ${roman}`;
}
function bulanFromDate(v) {
  const d = Utils.parseTanggal(v);
  if (!d) return "";
  return ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][d.getMonth()];
}

// ---------------- DETAIL PEKERJAAN ----------------
Page.pekerjaanDetail = async function (id) {
  const [pekerjaanRes, progressRes] = await Promise.all([Api.list("Pekerjaan"), Api.list("Progress")]);
  const item = (pekerjaanRes.data || []).find(p => String(p.ID) === String(id));
  const riwayat = (progressRes.data || []).filter(p => String(p.Pekerjaan_ID) === String(id))
    .sort((a, b) => (Utils.parseTanggal(b.Tanggal) || 0) - (Utils.parseTanggal(a.Tanggal) || 0));

  if (!item) { document.getElementById("content").innerHTML = `<div class="panel">Data tidak ditemukan.</div>`; return; }

  document.getElementById("content").innerHTML = `
    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">Informasi Pekerjaan</div>
        <table>
          <tr><td style="width:160px;color:var(--muted);">Kode Pekerjaan</td><td>PKJ-${String(item.ID).padStart(3, "0")}</td></tr>
          <tr><td style="color:var(--muted);">Pekerjaan</td><td>${Utils.escapeHtml(item["Nama Kegiatan/Pekerjaan"])}</td></tr>
          <tr><td style="color:var(--muted);">PIC</td><td>${Utils.escapeHtml(item.PIC)}</td></tr>
          <tr><td style="color:var(--muted);">Prioritas</td><td><span class="${Utils.prioritasBadgeClass(item.Prioritas)}">${Utils.escapeHtml(item.Prioritas || "-")}</span></td></tr>
          <tr><td style="color:var(--muted);">Status</td><td><span class="${Utils.statusBadgeClass(item.Status)}">${Utils.escapeHtml(item.Status || "-")}</span></td></tr>
          <tr><td style="color:var(--muted);">Deadline</td><td>${Utils.formatTanggal(item.Deadline)}</td></tr>
          <tr><td style="color:var(--muted);">Kendala</td><td>${Utils.escapeHtml(item.Kendala || "-")}</td></tr>
          <tr><td style="color:var(--muted);">Tindak Lanjut</td><td>${Utils.escapeHtml(item["Tindak Lanjut"] || "-")}</td></tr>
        </table>
      </div>
      <div class="panel">
        <div class="panel-title">Progress Terakhir</div>
        <div style="text-align:center;margin-bottom:14px;">
          <div style="font-size:34px;font-weight:700;color:var(--blue);">${item["Progres (%)"] || 0}%</div>
        </div>
        <div class="panel-title" style="font-size:13px;">Riwayat Progress</div>
        <table>
          <thead><tr><th>Tanggal</th><th>Progress</th><th>Keterangan</th><th>User</th></tr></thead>
          <tbody>
            ${riwayat.length ? riwayat.map(r => `<tr><td>${Utils.escapeHtml(r.Tanggal)}</td><td>${r["Progres (%)"]}%</td><td>${Utils.escapeHtml(r.Keterangan || "-")}</td><td>${Utils.escapeHtml(r.User || "-")}</td></tr>`).join("") : `<tr><td colspan="4" style="text-align:center;color:var(--muted);">Belum ada riwayat</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
    <button class="btn btn-outline" onclick="Router.go('pekerjaan')">&larr; Kembali</button>
  `;
};
