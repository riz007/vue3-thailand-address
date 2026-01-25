export * from "./types";
export { normalizeText } from "./core/normalize";
export {
  createThaiAddressIndex,
  mapLegacyThailandAddressRows,
  searchThaiAddress,
} from "./core/search";
export type { ThaiAddressIndex, ThaiAddressSearchOptions } from "./core/search";
export { loadDefaultThaiAddressData } from "./data";
export { useThaiAddress } from "./composables/useThaiAddress";
export type { UseThaiAddressOptions } from "./composables/useThaiAddress";
export { default as ThaiAddressAutocomplete } from "./components/ThaiAddressAutocomplete.vue";
export { default as ThaiAddressFields } from "./components/ThaiAddressFields.vue";
