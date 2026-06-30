// =============================================================
// HALAMAN: MASTER DATA (Struktur Organisasi, Status, Prioritas)
// =============================================================
Page._masterTabs = {
  struktur: { sheet: "Struktur Organisasi", label: "Struktur Organisasi / PIC", fields: ["Bidang", "Jabatan", "Nama"] },
  status: { sheet: "MasterStatus", label: "Status Pekerjaan", fields: ["Nama Status", "Warna"] },
  prioritas: { sheet: "MasterPrioritas", label: "Prioritas Pekerjaan", fields: ["Nama Prioritas", "Warna"] }
};
Page._masterActiveTab = "struktur";

Page.master = async function () {
  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:1px solid var(--border);">
        ${Object.entries(Page._masterTabs).map(([key, t]) => `
          <button class="btn btn-sm ${Page._masterActiveTab === key ? "btn-primary" : "btn-outline"}" style="border-radius:6px 6px 0 0;" onclick="Page._masterSwitch('${key}')">${t.label}</button>
        `).join("")}
      </div>
      <div class="toolbar"><div></div><button class="btn btn-primary" id="btn-master-tambah">+ Tambah Data</button></div>
      <div id="master-table"></div>
    </div>
  `;
  document.getElementById("btn-master-tambah").onclick = () => openMasterForm();
  await renderMasterTable();
};

Page._masterSwitch = (key) => { Page._masterActiveTab = key; Page.master(); };

async function renderMasterTable() {
  const t = Page._masterTabs[Page._masterActiveTab];
  const res = await Api.list(t.sheet);
  Page._masterData = res.data || [];

  document.getElementById("master-table").innerHTML = `
    <table>
      <thead><tr><th>No</th>${t.fields.map(f => `<th>${f}</th>`).join("")}<th>Aksi</th></tr></thead>
      <tbody>
        ${Page._masterData.length ? Page._masterData.map((row, i) => `
          <tr>
            <td>${i + 1}</td>
            ${t.fields.map(f => `<td>${Utils.escapeHtml(row[f] || "-")}</td>`).join("")}
            <td>
              <button class="icon-btn edit" onclick="Page._editMaster('${row.ID}')">&#9998;</button>
              <button class="icon-btn del" onclick="Page._delMaster('${row.ID}')">&#128465;</button>
            </td>
          </tr>`).join("") : `<tr><td colspan="${t.fields.length + 2}" style="text-align:center;color:var(--muted);">Tidak ada data</td></tr>`}
      </tbody>
    </table>
  `;
}

Page._editMaster = (id) => {
  const item = Page._masterData.find(r => String(r.ID) === String(id));
  openMasterForm(item);
};

Page._delMaster = async (id) => {
  if (!Utils.confirmDialog("Hapus data ini?")) return;
  const t = Page._masterTabs[Page._masterActiveTab];
  const res = await Api.remove(t.sheet, id);
  if (res.success) { Utils.toast("Data berhasil dihapus", "success"); renderMasterTable(); }
  else Utils.toast(res.message || "Gagal menghapus", "danger");
};

function openMasterForm(item) {
  const t = Page._masterTabs[Page._masterActiveTab];
  const isEdit = !!item;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>${isEdit ? "Ubah" : "Tambah"} ${t.label}</h3>
      <form id="form-master">
        ${t.fields.map(f => `<div class="form-row"><label>${f}</label><input name="${f}" required value="${item ? Utils.escapeHtml(item[f] || "") : ""}"></div>`).join("")}
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="btn-cancel">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#btn-cancel").onclick = () => overlay.remove();
  overlay.querySelector("#form-master").onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const res = isEdit ? await Api.update(t.sheet, item.ID, data) : await Api.create(t.sheet, data);
    if (res.success) { Utils.toast("Data berhasil disimpan", "success"); overlay.remove(); renderMasterTable(); }
    else Utils.toast(res.message || "Gagal menyimpan", "danger");
  };
}
