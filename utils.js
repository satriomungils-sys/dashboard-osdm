// =============================================================
// MODUL UTILS — fungsi bantu yang dipakai di banyak halaman
// =============================================================
const Utils = (() => {

  function parseTanggal(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    const parts = String(v).split(/[\/\-]/);
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }

  function formatTanggal(v) {
    const d = parseTanggal(v);
    if (!d) return "-";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function sisaHari(deadline) {
    const d = parseTanggal(deadline);
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((d - today) / 86400000);
  }

  function statusBadgeClass(status) {
    const s = String(status || "").toLowerCase();
    if (s === "selesai") return "badge badge-success";
    if (s === "terlambat") return "badge badge-danger";
    if (s === "review") return "badge badge-info";
    if (s === "belum mulai") return "badge badge-secondary";
    return "badge badge-warning"; // In Progress / Dalam Proses
  }

  function prioritasBadgeClass(p) {
    const s = String(p || "").toLowerCase();
    if (s === "tinggi" || s === "mendesak") return "badge badge-danger";
    if (s === "sedang") return "badge badge-warning";
    return "badge badge-secondary";
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function toast(message, type = "info") {
    let box = document.getElementById("toast-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast-box";
      document.body.appendChild(box);
    }
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.textContent = message;
    box.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3000);
  }

  function confirmDialog(message) {
    return window.confirm(message);
  }

  return { parseTanggal, formatTanggal, sisaHari, statusBadgeClass, prioritasBadgeClass, escapeHtml, toast, confirmDialog };
})();
