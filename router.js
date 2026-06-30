// =============================================================
// MODUL ROUTER — navigasi antar halaman (SPA, hash-based)
// =============================================================
const Router = (() => {
  const routes = {
    "dashboard": { title: "Dashboard", render: Page.dashboard, access: "dashboard" },
    "pekerjaan": { title: "Data Pekerjaan", render: Page.pekerjaan, access: "pekerjaan" },
    "pekerjaan-detail": { title: "Detail Pekerjaan", render: Page.pekerjaanDetail, access: "pekerjaan" },
    "progress": { title: "Update Progress", render: Page.progress, access: "progress" },
    "master": { title: "Master Data", render: Page.master, access: "master" },
    "monitoring": { title: "Dashboard Monitoring", render: Page.monitoring, access: "monitoring" },
    "laporan": { title: "Laporan Pekerjaan", render: Page.laporan, access: "laporan" },
    "notifikasi": { title: "Notifikasi", render: Page.notifikasi, access: "notifikasi" },
    "audit": { title: "Audit Log", render: Page.audit, access: "audit" },
    "pengaturan": { title: "Pengaturan", render: Page.pengaturan, access: "pengaturan" }
  };

  function current() {
    const hash = location.hash.replace("#/", "") || "dashboard";
    const [page, param] = hash.split("/");
    return { page, param };
  }

  function go(page, param) {
    location.hash = "#/" + page + (param ? "/" + param : "");
  }

  async function render() {
    if (!Auth.isLoggedIn()) {
      document.getElementById("login-screen").classList.remove("hidden");
      document.getElementById("app-shell").classList.add("hidden");
      return;
    }
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");

    const { page, param } = current();
    const route = routes[page] || routes["dashboard"];

    if (!Auth.can(route.access)) {
      document.getElementById("content").innerHTML =
        `<div class="panel">Anda tidak memiliki akses ke halaman ini.</div>`;
      return;
    }

    document.querySelectorAll(".sidebar nav a").forEach(a => {
      a.classList.toggle("active", a.dataset.page === page);
    });
    document.getElementById("page-title").textContent = route.title;
    document.getElementById("page-crumb").textContent = "Dashboard / " + route.title;
    document.getElementById("content").innerHTML = `<div class="panel">Memuat data...</div>`;

    try {
      await route.render(param);
    } catch (err) {
      document.getElementById("content").innerHTML =
        `<div class="panel">Gagal memuat data: ${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  window.addEventListener("hashchange", render);

  return { go, render, current };
})();
