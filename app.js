// =============================================================
// APP BOOTSTRAP
// =============================================================
const MENU = [
  { page: "dashboard", label: "Dashboard", icon: "&#127968;" },
  { page: "pekerjaan", label: "Data Pekerjaan", icon: "&#128203;" },
  { page: "progress", label: "Update Progress", icon: "&#128200;" },
  { page: "master", label: "Master Data", icon: "&#128193;" },
  { page: "monitoring", label: "Dashboard Monitoring", icon: "&#128202;" },
  { page: "laporan", label: "Laporan", icon: "&#128196;" },
  { page: "notifikasi", label: "Notifikasi", icon: "&#128276;" },
  { page: "audit", label: "Audit Log", icon: "&#128221;" },
  { page: "pengaturan", label: "Pengaturan", icon: "&#9881;" }
];

function buildSidebar() {
  const user = Auth.currentUser();
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = MENU.filter(m => Auth.can(m.page)).map(m =>
    `<a data-page="${m.page}" onclick="Router.go('${m.page}')"><span>${m.icon}</span> ${m.label}</a>`
  ).join("");
  document.getElementById("topbar-user-name").textContent = user ? (user.Nama || user.Username) : "";
  document.getElementById("topbar-user-role").textContent = user ? user.Role : "";
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const errBox = document.getElementById("login-error");
  errBox.textContent = "";

  if (API_URL.includes("PASTE_URL")) {
    errBox.textContent = "API_URL belum dikonfigurasi di js/config.js";
    return;
  }

  try {
    const res = await Auth.login(username, password);
    if (res.success) {
      buildSidebar();
      Router.go("dashboard");
      Router.render();
    } else {
      errBox.textContent = res.message || "Login gagal.";
    }
  } catch (err) {
    errBox.textContent = "Tidak dapat terhubung ke server: " + err.message;
  }
});

document.getElementById("btn-logout").addEventListener("click", () => Auth.logout());
document.getElementById("btn-burger").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

(function init() {
  if (Auth.isLoggedIn()) {
    buildSidebar();
  }
  Router.render();
})();
