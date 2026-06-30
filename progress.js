// =============================================================
// HALAMAN: UPDATE PROGRESS
// =============================================================
Page.progress = async function () {
  const pekerjaanRes = await Api.list("Pekerjaan");
  const list = pekerjaanRes.data || [];

  document.getElementById("content").innerHTML = `
    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">Pekerjaan</div>
        <div class="form-row">
          <select id="sel-pekerjaan">
            <option value="">-- Pilih Pekerjaan --</option>
            ${list.map(p => `<option value="${p.ID}">PKJ-${String(p.ID).padStart(3, "0")} - ${Utils.escapeHtml(p["Nama Kegiatan/Pekerjaan"])}</option>`).join("")}
          </select>
        </div>
        <div class="form-row"><label>Tanggal Update</label><input type="date" id="f-tanggal" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="form-row"><label>Progress (%)</label><input type="number" id="f-progres" min="0" max="100" placeholder="0 - 100"></div>
        <div class="form-row"><label>Keterangan</label><textarea id="f-keterangan" rows="3" placeholder="Jelaskan perkembangan pekerjaan..."></textarea></div>
        <div class="form-row"><label>Lampiran (Opsional, tautan dokumen)</label><input id="f-lampiran" placeholder="https://drive.google.com/..."></div>
        <button class="btn btn-primary" id="btn-simpan-progress">Simpan</button>
      </div>
      <div class="panel">
        <div class="panel-title">Riwayat Progress</div>
        <table id="riwayat-table">
          <thead><tr><th>Tanggal</th><th>Progress (%)</th><th>Keterangan</th><th>User</th></tr></thead>
          <tbody><tr><td colspan="4" style="text-align:center;color:var(--muted);">Pilih pekerjaan untuk melihat riwayat</td></tr></tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("sel-pekerjaan").onchange = async (e) => {
    const id = e.target.value;
    if (!id) return;
    const item = list.find(p => String(p.ID) === id);
    document.getElementById("f-progres").value = item ? item["Progres (%)"] : "";
    await loadRiwayat(id);
  };

  document.getElementById("btn-simpan-progress").onclick = async () => {
    const id = document.getElementById("sel-pekerjaan").value;
    const progres = document.getElementById("f-progres").value;
    const keterangan = document.getElementById("f-keterangan").value;
    const lampiran = document.getElementById("f-lampiran").value;
    if (!id) { Utils.toast("Pilih pekerjaan terlebih dahulu", "danger"); return; }
    if (progres === "" || progres < 0 || progres > 100) { Utils.toast("Progress (%) harus 0 - 100", "danger"); return; }

    const res = await Api.addProgress(id, progres, keterangan, lampiran);
    if (res.success) {
      Utils.toast("Progress berhasil disimpan", "success");
      document.getElementById("f-keterangan").value = "";
      document.getElementById("f-lampiran").value = "";
      await loadRiwayat(id);
    } else {
      Utils.toast(res.message || "Gagal menyimpan progress", "danger");
    }
  };
};

async function loadRiwayat(id) {
  const res = await Api.list("Progress");
  const riwayat = (res.data || []).filter(r => String(r.Pekerjaan_ID) === String(id))
    .sort((a, b) => (Utils.parseTanggal(b.Tanggal) || 0) - (Utils.parseTanggal(a.Tanggal) || 0));
  document.querySelector("#riwayat-table tbody").innerHTML = riwayat.length
    ? riwayat.map(r => `<tr><td>${Utils.escapeHtml(r.Tanggal)}</td><td>${r["Progres (%)"]}</td><td>${Utils.escapeHtml(r.Keterangan || "-")}</td><td>${Utils.escapeHtml(r.User || "-")}</td></tr>`).join("")
    : `<tr><td colspan="4" style="text-align:center;color:var(--muted);">Belum ada riwayat</td></tr>`;
}
