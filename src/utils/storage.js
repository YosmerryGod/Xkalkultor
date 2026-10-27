// Pembungkus localStorage yang aman (tidak crash bila storage diblokir/penuh).
export const LS = {
  get: (k, fb) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fb;
    } catch {
      return fb;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* storage penuh / diblokir */
    }
  },
  del: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* abaikan */
    }
  },
};
