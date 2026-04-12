export function signIn(email, password) {
  const token = `demo-token-${email || "guest"}`;
  localStorage.setItem("builder_token", token);
  return { ok: true, email, token };
}

export function getToken() {
  return localStorage.getItem("builder_token") || "";
}