// =============================================================
// MODUL API — komunikasi dengan backend Google Apps Script
// =============================================================
const Api = (() => {

  async function call(action, payload = {}, method = "POST") {
    const user = Auth.currentUser();
    const body = Object.assign({ action, user: user ? user.Username : "-" }, payload);

    if (method === "GET") {
      const qs = new URLSearchParams(body).toString();
      const res = await fetch(`${API_URL}?${qs}`);
      return res.json();
    }

    // Gunakan text/plain agar tidak memicu CORS preflight pada Apps Script Web App
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  return {
    login: (username, password) => call("login", { username, password }),
    dashboard: () => call("dashboard", {}, "GET"),
    list: (sheet) => call("list", { sheet }, "GET"),
    create: (sheet, data) => call("create", { sheet, data }),
    update: (sheet, id, data) => call("update", { sheet, id, data }),
    remove: (sheet, id) => call("delete", { sheet, id }),
    addProgress: (pekerjaanId, progres, keterangan, lampiran) =>
      call("addProgress", { pekerjaanId, progres, keterangan, lampiran })
  };
})();
