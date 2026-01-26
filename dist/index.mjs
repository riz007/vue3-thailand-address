import { loadDefaultThaiAddressData as ze } from "./data.mjs";
import { ref as A, shallowRef as K, watch as D, unref as I, getCurrentInstance as Q, onBeforeUnmount as j, defineComponent as q, computed as _, openBlock as T, createElementBlock as $, normalizeClass as F, createElementVNode as L, Fragment as ee, renderList as te, withModifiers as ne, renderSlot as Z, toDisplayString as re, createTextVNode as se, createCommentVNode as ie } from "vue";
function C(e) {
  return e == null ? "" : String(e).trim().toLowerCase().replace(/\s+/g, " ");
}
const V = /* @__PURE__ */ new WeakMap();
function oe(e) {
  return e == null ? "" : String(e).replace(/\D/g, "");
}
function le(e) {
  return !e || typeof e != "object" ? null : {
    subdistrict: e.subdistrict != null ? String(e.subdistrict).trim() : "",
    district: e.district != null ? String(e.district).trim() : "",
    province: e.province != null ? String(e.province).trim() : "",
    zipcode: e.zipcode != null ? String(e.zipcode).trim() : ""
  };
}
function R(e) {
  const i = [], s = /* @__PURE__ */ new Map();
  return e.forEach((t, o) => {
    const n = le(t);
    if (!n)
      return;
    const a = {
      subdistrict: C(n.subdistrict),
      district: C(n.district),
      province: C(n.province),
      zipcode: oe(n.zipcode)
    }, l = { row: n, normalized: a, index: o };
    i.push(l), s.set(n, l);
  }), { entries: i, entryByRow: s };
}
function ce(e) {
  const i = V.get(e);
  if (i)
    return i;
  const s = R(e.all || []);
  return V.set(e, s), s;
}
function ue(e, i) {
  return i ? e.subdistrict.length > 0 && e.subdistrict.startsWith(i) || e.district.length > 0 && e.district.startsWith(i) || e.province.length > 0 && e.province.startsWith(i) || e.zipcode.length > 0 && e.zipcode.startsWith(i) : !1;
}
function ae(e, i) {
  return i ? e.subdistrict.length > 0 && e.subdistrict.includes(i) || e.district.length > 0 && e.district.includes(i) || e.province.length > 0 && e.province.includes(i) || e.zipcode.length > 0 && e.zipcode.includes(i) : !1;
}
function k(e, i) {
  return i ? { ...e, formatted: i(e) } : e;
}
function de(e, i, s) {
  const t = [];
  for (const [o, n] of e.entries())
    if (o.startsWith(i))
      for (const a of n) {
        const l = s.entryByRow.get(a);
        l && t.push(l);
      }
  return t.sort((o, n) => o.index - n.index), t;
}
function B(e) {
  const i = Array.isArray(e) ? e : [], s = R(i), t = /* @__PURE__ */ new Map();
  for (const n of s.entries) {
    const a = n.normalized.zipcode;
    if (!a)
      continue;
    const l = t.get(a);
    l ? l.push(n.row) : t.set(a, [n.row]);
  }
  const o = {
    byZipcode: t,
    all: s.entries.map((n) => n.row)
  };
  return V.set(o, s), o;
}
function O(e, i, s = {}) {
  const t = C(i);
  if (!t)
    return [];
  const o = typeof s.limit == "number" && Number.isFinite(s.limit) ? Math.max(0, s.limit) : 1 / 0;
  if (o === 0)
    return [];
  const n = s.format, a = /^\d+$/.test(t), l = a ? t : t.replace(/\D/g, "");
  let v, S, d = null;
  if (Array.isArray(e))
    v = R(e), S = v.entries;
  else if (e && typeof e == "object")
    d = e, v = ce(d), S = v.entries;
  else
    return [];
  const m = [], b = [], M = [], c = /* @__PURE__ */ new Set();
  if (a && d?.byZipcode && l) {
    const h = de(
      d.byZipcode,
      l,
      v
    );
    for (const f of h)
      if (m.push(k(f.row, n)), c.add(f.row), m.length >= o)
        return m.slice(0, o);
  }
  if (!a || m.length < o || !d)
    for (const h of S) {
      if (c.has(h.row))
        continue;
      const f = h.normalized;
      if (a && l && f.zipcode.startsWith(l)) {
        m.push(k(h.row, n)), c.add(h.row);
        continue;
      }
      if (ue(f, t)) {
        b.push(k(h.row, n));
        continue;
      }
      ae(f, t) && M.push(k(h.row, n));
    }
  const p = m.concat(b, M);
  return p.length > o ? p.slice(0, o) : p;
}
function x(e) {
  return e == null ? "" : String(e).trim();
}
function Se(e) {
  if (!Array.isArray(e))
    return [];
  const i = [];
  for (const s of e) {
    if (!s || typeof s != "object")
      continue;
    const t = s, o = "amphoe" in t || "amphur" in t, n = x(
      o ? t.district ?? t.tambon ?? t.subdistrict ?? t.sub_district : t.subdistrict ?? t.tambon ?? t.district ?? t.sub_district
    ), a = x(
      o ? t.amphoe ?? t.amphur ?? t.district : t.district ?? t.amphoe ?? t.amphur
    ), l = x(t.province ?? t.changwat), v = x(t.zipcode ?? t.zip ?? t.postcode);
    !n && !a && !l && !v || i.push({ subdistrict: n, district: a, province: l, zipcode: v });
  }
  return i;
}
function fe(e) {
  return `${e.subdistrict}, ${e.district}, ${e.province} ${e.zipcode}`.trim();
}
function Me(e) {
  const i = A(""), s = A([]), t = A(!1), o = K(null);
  let n = null;
  const a = () => I(e.limit) ?? 10, l = () => I(e.minChars) ?? 2, v = () => I(e.debounceMs) ?? 150, S = (c) => {
    if (!c) {
      o.value = null;
      return;
    }
    o.value = Array.isArray(c) ? B(c) : c;
  };
  D(
    () => I(e.data),
    (c) => S(c),
    { immediate: !0 }
  );
  const d = (c) => {
    const y = l();
    if (!o.value || c.length < y)
      return s.value = [], t.value = !1, [];
    const p = O(o.value, c, {
      limit: a(),
      format: e.format
    });
    return s.value = p, t.value = p.length > 0, p;
  }, m = (c) => {
    const y = typeof c == "string" ? c : i.value;
    typeof c == "string" && (i.value = c), n && (clearTimeout(n), n = null);
    const p = v();
    return p <= 0 ? d(y) : (n = setTimeout(() => {
      d(y), n = null;
    }, p), s.value);
  }, b = () => {
    n && (clearTimeout(n), n = null), i.value = "", s.value = [], t.value = !1;
  }, M = (c) => {
    if (!c)
      return "";
    const y = c.formatted ?? (e.format ? e.format(c) : fe(c));
    return i.value = y, s.value = [], t.value = !1, y;
  };
  return Q() && j(() => {
    n && (clearTimeout(n), n = null);
  }), {
    query: i,
    suggestions: s,
    isOpen: t,
    search: m,
    clear: b,
    select: M
  };
}
const pe = ["disabled", "placeholder", "value"], ve = {
  key: 0,
  class: "ta-dropdown"
}, he = {
  key: 0,
  class: "ta-list",
  role: "listbox"
}, me = ["onMousedown", "onMouseenter"], be = { class: "ta-option-text" }, ye = {
  key: 1,
  class: "ta-no-results"
}, we = /* @__PURE__ */ q({
  __name: "ThaiAddressAutocomplete",
  props: {
    modelValue: {},
    data: {},
    limit: {},
    minChars: {},
    debounceMs: {},
    placeholder: {},
    disabled: { type: Boolean },
    clearOnSelect: { type: Boolean },
    formatInput: { type: Function }
  },
  emits: ["update:modelValue", "select", "open", "close"],
  setup(e, { emit: i }) {
    const s = e, t = i, o = A(s.modelValue ?? ""), n = A([]), a = A(!1), l = A(-1), v = K(null), S = A(null);
    let d = null;
    const m = _(() => s.limit ?? 10), b = _(() => s.minChars ?? 2), M = _(() => s.debounceMs ?? 150), c = _(() => !!s.disabled), y = _(() => !!s.clearOnSelect), p = _(
      () => a.value && !c.value && o.value.length >= b.value
    ), h = (r) => `${r.subdistrict}, ${r.district}, ${r.province} ${r.zipcode}`.trim(), f = (r) => {
      a.value !== r && (a.value = r, t(r ? "open" : "close"));
    }, U = (r) => {
      v.value = B(r ?? []);
    }, z = (r, u = !0) => {
      if (c.value || r.length < b.value)
        return n.value = [], l.value = -1, f(!1), [];
      const w = v.value ?? B(s.data ?? []), g = O(w, r, { limit: m.value });
      return n.value = g, l.value = g.length > 0 ? 0 : -1, f(u ? !0 : g.length > 0), g;
    }, W = (r) => {
      d && (clearTimeout(d), d = null);
      const u = M.value;
      if (u <= 0) {
        z(r, !0);
        return;
      }
      d = setTimeout(() => {
        z(r, !0), d = null;
      }, u);
    }, P = (r) => {
      const u = r.target.value;
      o.value = u, t("update:modelValue", u), W(u);
    }, G = () => {
      c.value || o.value.length >= b.value && (n.value.length > 0 ? f(!0) : z(o.value, !1));
    }, H = () => {
      f(!1), l.value = -1;
    }, E = (r) => {
      if (!n.value.length)
        return;
      p.value || f(!0);
      const u = l.value + r;
      u < 0 ? l.value = n.value.length - 1 : u >= n.value.length ? l.value = 0 : l.value = u;
    }, N = (r) => {
      if (!r)
        return;
      t("select", r);
      const u = s.formatInput ? s.formatInput(r) : h(r), w = y.value ? "" : u;
      o.value = w, t("update:modelValue", w), n.value = [], l.value = -1, f(!1);
    }, J = (r) => {
      if (!c.value)
        switch (r.key) {
          case "ArrowDown":
            r.preventDefault(), E(1);
            break;
          case "ArrowUp":
            r.preventDefault(), E(-1);
            break;
          case "Enter":
            p.value && l.value >= 0 && (r.preventDefault(), N(n.value[l.value]));
            break;
          case "Escape":
            r.preventDefault(), f(!1), l.value = -1;
            break;
        }
    }, X = (r, u) => `${r.zipcode}-${r.subdistrict}-${r.district}-${r.province}-${u}`;
    return D(
      () => s.modelValue,
      (r) => {
        const u = r ?? "";
        u !== o.value && (o.value = u, u.length >= b.value ? W(u) : (n.value = [], f(!1)));
      },
      { immediate: !0 }
    ), D(
      () => s.data,
      (r) => {
        U(r), a.value && o.value.length >= b.value && z(o.value, !0);
      },
      { immediate: !0 }
    ), j(() => {
      d && (clearTimeout(d), d = null);
    }), (r, u) => (T(), $("div", {
      class: F(["ta-autocomplete", { disabled: c.value }])
    }, [
      L("input", {
        ref_key: "inputRef",
        ref: S,
        class: "ta-input",
        type: "text",
        disabled: c.value,
        placeholder: e.placeholder,
        value: o.value,
        autocomplete: "off",
        onInput: P,
        onFocus: G,
        onBlur: H,
        onKeydown: J
      }, null, 40, pe),
      p.value ? (T(), $("div", ve, [
        n.value.length ? (T(), $("ul", he, [
          (T(!0), $(ee, null, te(n.value, (w, g) => (T(), $("li", {
            key: X(w, g),
            class: F(["ta-option", { active: g === l.value }]),
            onMousedown: ne((Y) => N(w), ["prevent"]),
            onMouseenter: (Y) => l.value = g
          }, [
            Z(r.$slots, "option", {
              suggestion: w,
              index: g
            }, () => [
              L("span", be, re(h(w)), 1)
            ], !0)
          ], 42, me))), 128))
        ])) : (T(), $("div", ye, [
          Z(r.$slots, "no-results", {}, () => [
            u[0] || (u[0] = se("No results", -1))
          ], !0)
        ]))
      ])) : ie("", !0)
    ], 2));
  }
}), ge = (e, i) => {
  const s = e.__vccOpts || e;
  for (const [t, o] of i)
    s[t] = o;
  return s;
}, _e = /* @__PURE__ */ ge(we, [["__scopeId", "data-v-2b7bda94"]]);
export {
  _e as ThaiAddressAutocomplete,
  B as createThaiAddressIndex,
  ze as loadDefaultThaiAddressData,
  Se as mapLegacyThailandAddressRows,
  C as normalizeText,
  O as searchThaiAddress,
  Me as useThaiAddress
};
