import {
  getCurrentInstance,
  onBeforeUnmount,
  ref,
  shallowRef,
  unref,
  watch,
} from "vue";
import type { Ref } from "vue";
import { createThaiAddressIndex, searchThaiAddress } from "../core/search";
import type {
  ThaiAddressIndex,
  ThaiAddressSearchOptions,
} from "../core/search";
import type { ThaiAddressRow, ThaiAddressSuggestion } from "../types";

type MaybeRef<T> = T | Ref<T>;

export type UseThaiAddressOptions = {
  data: MaybeRef<ThaiAddressRow[] | ThaiAddressIndex>;
  limit?: MaybeRef<number | undefined>;
  minChars?: MaybeRef<number | undefined>;
  debounceMs?: MaybeRef<number | undefined>;
  format?: ThaiAddressSearchOptions["format"];
};

function formatDefault(suggestion: ThaiAddressSuggestion): string {
  return `${suggestion.subdistrict}, ${suggestion.district}, ${suggestion.province} ${suggestion.zipcode}`.trim();
}

export function useThaiAddress(options: UseThaiAddressOptions) {
  const query = ref("");
  const suggestions = ref<ThaiAddressSuggestion[]>([]);
  const isOpen = ref(false);
  const indexRef = shallowRef<ThaiAddressIndex | null>(null);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const resolveLimit = () => unref(options.limit) ?? 10;
  const resolveMinChars = () => unref(options.minChars) ?? 2;
  const resolveDebounceMs = () => unref(options.debounceMs) ?? 150;

  const updateIndex = (
    data: ThaiAddressRow[] | ThaiAddressIndex | null | undefined,
  ) => {
    if (!data) {
      indexRef.value = null;
      return;
    }

    indexRef.value = Array.isArray(data) ? createThaiAddressIndex(data) : data;
  };

  watch(
    () => unref(options.data),
    (data) => updateIndex(data),
    { immediate: true },
  );

  const runSearch = (value: string): ThaiAddressSuggestion[] => {
    const minChars = resolveMinChars();
    if (!indexRef.value || value.length < minChars) {
      suggestions.value = [];
      isOpen.value = false;
      return [];
    }

    const results = searchThaiAddress(indexRef.value, value, {
      limit: resolveLimit(),
      format: options.format,
    });

    suggestions.value = results;
    isOpen.value = results.length > 0;
    return results;
  };

  const search = (nextQuery?: string): ThaiAddressSuggestion[] => {
    const value = typeof nextQuery === "string" ? nextQuery : query.value;
    if (typeof nextQuery === "string") {
      query.value = nextQuery;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    const delay = resolveDebounceMs();
    if (delay <= 0) {
      return runSearch(value);
    }

    debounceTimer = setTimeout(() => {
      runSearch(value);
      debounceTimer = null;
    }, delay);

    return suggestions.value;
  };

  const clear = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    query.value = "";
    suggestions.value = [];
    isOpen.value = false;
  };

  const select = (suggestion: ThaiAddressSuggestion) => {
    if (!suggestion) {
      return "";
    }

    const formatted =
      suggestion.formatted ??
      (options.format ? options.format(suggestion) : formatDefault(suggestion));

    query.value = formatted;
    suggestions.value = [];
    isOpen.value = false;
    return formatted;
  };

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    });
  }

  return {
    query,
    suggestions,
    isOpen,
    search,
    clear,
    select,
  };
}
