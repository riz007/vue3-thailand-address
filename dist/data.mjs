const a = 'Optional dependency "@riz007/thai-address-data" is not installed. Install it or provide your own dataset via the data prop/composable option.', r = /Cannot find module|Cannot find package|Failed to resolve|ERR_MODULE_NOT_FOUND|MODULE_NOT_FOUND/i, e = {
  importDefaultDataset: () => import("@riz007/thai-address-data/data.json")
};
async function s() {
  try {
    const t = await e.importDefaultDataset(), o = t.default ?? t;
    if (!Array.isArray(o))
      throw new Error("Default dataset is not an array.");
    return o;
  } catch (t) {
    const o = typeof t?.code == "string" ? t.code : "";
    throw o === "ERR_MODULE_NOT_FOUND" || o === "MODULE_NOT_FOUND" || t instanceof Error && r.test(t.message) ? new Error(a) : t instanceof Error ? t : new Error(a);
  }
}
export {
  e as __internal,
  s as loadDefaultThaiAddressData
};
