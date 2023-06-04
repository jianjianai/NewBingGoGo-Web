// from https://github.com/adams549659584/go-proxy-bingai/blob/master/frontend/src/utils/cookies.ts
export function get(name) {
  const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return v ? v[2] : null;
}

export function set(name, value, minutes = 0, path = "/", domain = "") {
  let cookie = name + "=" + value + ";path=" + path;
  if (domain) {
    cookie += ";domain=" + domain;
  }
  if (minutes > 0) {
    const d = new Date();
    d.setTime(d.getTime() + minutes * 60 * 1000);
    cookie += ";expires=" + d.toUTCString();
  }
  document.cookie = cookie;
}

const cookies = {
  get,
  set,
};
export default cookies;
