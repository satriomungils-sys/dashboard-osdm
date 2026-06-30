// =============================================================
// MODUL AUTH — login, logout, session, hak akses (role)
// =============================================================
const Auth = (() => {
  const SESSION_KEY = "osdm_session";
  let memoryUser = null; // fallback jika sessionStorage tidak tersedia

  function currentUser() {
    if (memoryUser) return memoryUser;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    memoryUser = user;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch (e) {}
  }

  function logout() {
    memoryUser = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    location.hash = "#/login";
    Router.render();
  }

  function isLoggedIn() {
    return !!currentUser();
  }

  // Daftar role yang diizinkan untuk tiap halaman/menu
  const ROLE_ACCESS = {
    dashboard: ["Administrator", "Koordinator", "PIC"],
    pekerjaan: ["Administrator", "Koordinator", "PIC"],
    progress: ["Administrator", "Koordinator", "PIC"],
    master: ["Administrator", "Koordinator"],
    monitoring: ["Administrator", "Koordinator"],
    laporan: ["Administrator", "Koordinator"],
    notifikasi: ["Administrator", "Koordinator", "PIC"],
    audit: ["Administrator"],
    pengaturan: ["Administrator"]
  };

  function can(page) {
    const user = currentUser();
    if (!user) return false;
    const allowed = ROLE_ACCESS[page];
    if (!allowed) return true;
    return allowed.includes(user.Role);
  }

  async function login(username, password) {
    const res = await Api.login(username, password);
    if (res.success) setUser(res.user);
    return res;
  }

  return { currentUser, login, logout, isLoggedIn, can };
})();
