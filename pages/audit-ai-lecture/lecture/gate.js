"use strict";
/* 비밀번호로 이 장을 연다. 성공하면 키를 이 탭(sessionStorage)에만 기억해 다른 장은 다시 묻지 않는다.
   비밀번호 자체는 저장하지 않는다. */
(async () => {
  const data = JSON.parse(document.getElementById("gate-data").textContent);
  const form = document.getElementById("gate-form"), input = document.getElementById("gate-pw"), msg = document.getElementById("gate-msg");
  const bytes = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  const STORE = "audit-lecture-key";

  async function open(key) {
    // 문서를 읽는 중에 document.open을 부르면 교체되지 않고 덧붙는다(같은 탭 자동 열기에서 입장 상자가 남던 원인).
    if (document.readyState !== "complete") await new Promise((r) => addEventListener("load", r, { once: true }));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(data.iv) }, key, bytes(data.ct));
    const html = new TextDecoder().decode(plain);
    document.open(); document.write(html); document.close();
  }
  async function fromSession() {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (!raw) return false;
      const key = await crypto.subtle.importKey("raw", bytes(raw), "AES-GCM", false, ["decrypt"]);
      await open(key); return true;
    } catch { try { sessionStorage.removeItem(STORE); } catch {} return false; }
  }
  if (!window.crypto || !crypto.subtle) { msg.textContent = "이 브라우저에서는 열 수 없습니다. 최신 크롬·엣지·사파리에서 열어 주세요."; return; }
  if (await fromSession()) return;
  input.focus();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "여는 중입니다";
    try {
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(input.value), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: bytes(data.salt), iterations: data.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
      const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
      await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(data.iv) }, key, bytes(data.ct));
      try { sessionStorage.setItem(STORE, btoa(String.fromCharCode(...raw))); } catch {}
      await open(key);
    } catch {
      msg.textContent = "비밀번호가 맞지 않습니다";
      input.select();
    }
  });
})();
