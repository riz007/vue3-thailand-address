<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from "vue";
import { createThaiAddressIndex, searchThaiAddress } from "../core/search";
import { normalizeText } from "../core/normalize";
import type { ThaiAddressIndex } from "../core/search";
import type { ThaiAddressRow, ThaiAddressSuggestion } from "../types";

type Field = keyof ThaiAddressRow;

const fields: Field[] = ["subdistrict", "district", "province", "zipcode"];

const defaultLabels: Record<Field, string> = {
  subdistrict: "Subdistrict",
  district: "District",
  province: "Province",
  zipcode: "Zipcode",
};

const defaultPlaceholders: Record<Field, string> = {
  subdistrict: "Type subdistrict",
  district: "Type district",
  province: "Type province",
  zipcode: "Type zipcode",
};

const props = defineProps<{
  modelValue: ThaiAddressRow;
  data: ThaiAddressRow[];
  limit?: number;
  minChars?: number;
  debounceMs?: number;
  disabled?: boolean;
  labels?: Partial<Record<Field, string>>;
  placeholders?: Partial<Record<Field, string>>;
  showLabels?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ThaiAddressRow): void;
  (
    e: "select",
    value: { field: Field; suggestion: ThaiAddressSuggestion },
  ): void;
  (e: "open", value: Field): void;
  (e: "close", value: Field): void;
}>();

const values = reactive<ThaiAddressRow>({
  subdistrict: props.modelValue?.subdistrict ?? "",
  district: props.modelValue?.district ?? "",
  province: props.modelValue?.province ?? "",
  zipcode: props.modelValue?.zipcode ?? "",
});

const suggestions = reactive<Record<Field, ThaiAddressSuggestion[]>>({
  subdistrict: [],
  district: [],
  province: [],
  zipcode: [],
});

const isOpen = reactive<Record<Field, boolean>>({
  subdistrict: false,
  district: false,
  province: false,
  zipcode: false,
});

const activeIndex = reactive<Record<Field, number>>({
  subdistrict: -1,
  district: -1,
  province: -1,
  zipcode: -1,
});

const debounceTimers: Record<Field, ReturnType<typeof setTimeout> | null> = {
  subdistrict: null,
  district: null,
  province: null,
  zipcode: null,
};

const indexRef = shallowRef<ThaiAddressIndex | null>(null);

const limit = computed(() => props.limit ?? 10);
const minChars = computed(() => props.minChars ?? 2);
const debounceMs = computed(() => props.debounceMs ?? 150);
const isDisabled = computed<boolean>(() => !!props.disabled);
const shouldShowLabels = computed<boolean>(() => props.showLabels ?? true);

const labelFor = (field: Field) =>
  props.labels?.[field] ?? defaultLabels[field];

const placeholderFor = (field: Field) =>
  props.placeholders?.[field] ?? defaultPlaceholders[field];

const formatSuggestion = (suggestion: ThaiAddressSuggestion) =>
  `${suggestion.subdistrict}, ${suggestion.district}, ${suggestion.province} ${suggestion.zipcode}`.trim();

const updateIndex = (data: ThaiAddressRow[] | null | undefined) => {
  indexRef.value = createThaiAddressIndex(data ?? []);
};

watch(
  () => props.data,
  (data) => {
    updateIndex(data);
    for (const field of fields) {
      if (isOpen[field] && values[field].length >= minChars.value) {
        runSearch(field, values[field], true);
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (next) => {
    const nextValue = next ?? ({} as ThaiAddressRow);
    for (const field of fields) {
      const value = nextValue[field] ?? "";
      if (value !== values[field]) {
        values[field] = value;
      }
    }
  },
  { deep: true },
);

const normalizeZipcode = (value: string) =>
  value == null ? "" : String(value).replace(/\D/g, "");

const getQueryLength = (field: Field, value: string) =>
  field === "zipcode" ? normalizeZipcode(value).length : value.length;

const matchesField = (
  suggestion: ThaiAddressSuggestion,
  field: Field,
  query: string,
) => {
  if (!query) {
    return false;
  }

  if (field === "zipcode") {
    const queryDigits = normalizeZipcode(query);
    if (!queryDigits) {
      return false;
    }
    const normalizedZip = normalizeZipcode(suggestion.zipcode);
    return (
      normalizedZip.startsWith(queryDigits) ||
      normalizedZip.includes(queryDigits)
    );
  }

  const normalizedQuery = normalizeText(query);
  const normalizedField = normalizeText(suggestion[field]);
  return (
    normalizedField.startsWith(normalizedQuery) ||
    normalizedField.includes(normalizedQuery)
  );
};

const setOpen = (field: Field, next: boolean) => {
  if (isOpen[field] === next) {
    return;
  }

  isOpen[field] = next;
  if (next) {
    emit("open", field);
  } else {
    emit("close", field);
  }
};

const emitModelValue = () => {
  emit("update:modelValue", { ...values });
};

const runSearch = (
  field: Field,
  value: string,
  openOnEmpty = true,
): ThaiAddressSuggestion[] => {
  const queryLength = getQueryLength(field, value);
  if (isDisabled.value || queryLength < minChars.value) {
    suggestions[field] = [];
    activeIndex[field] = -1;
    setOpen(field, false);
    return [];
  }

  const index = indexRef.value ?? createThaiAddressIndex(props.data ?? []);
  const searchLimit = Math.max(limit.value * 5, limit.value);
  const results = searchThaiAddress(index, value, { limit: searchLimit });
  const filtered = results.filter((entry) => matchesField(entry, field, value));
  const sliced = filtered.slice(0, limit.value);

  suggestions[field] = sliced;
  activeIndex[field] = sliced.length > 0 ? 0 : -1;
  setOpen(field, openOnEmpty ? true : sliced.length > 0);
  return sliced;
};

const scheduleSearch = (field: Field, value: string) => {
  if (debounceTimers[field]) {
    clearTimeout(debounceTimers[field]!);
    debounceTimers[field] = null;
  }

  const delay = debounceMs.value;
  if (delay <= 0) {
    runSearch(field, value, true);
    return;
  }

  debounceTimers[field] = setTimeout(() => {
    runSearch(field, value, true);
    debounceTimers[field] = null;
  }, delay);
};

const handleInput = (field: Field, event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  values[field] = value;
  emitModelValue();
  scheduleSearch(field, value);
};

const handleFocus = (field: Field) => {
  if (isDisabled.value) {
    return;
  }

  const value = values[field];
  if (getQueryLength(field, value) >= minChars.value) {
    if (suggestions[field].length > 0) {
      setOpen(field, true);
    } else {
      runSearch(field, value, false);
    }
  }
};

const handleBlur = (field: Field) => {
  setOpen(field, false);
  activeIndex[field] = -1;
};

const moveActive = (field: Field, direction: 1 | -1) => {
  if (!suggestions[field].length) {
    return;
  }

  if (!isOpen[field]) {
    setOpen(field, true);
  }

  const nextIndex = activeIndex[field] + direction;
  if (nextIndex < 0) {
    activeIndex[field] = suggestions[field].length - 1;
  } else if (nextIndex >= suggestions[field].length) {
    activeIndex[field] = 0;
  } else {
    activeIndex[field] = nextIndex;
  }
};

const closeAll = () => {
  for (const field of fields) {
    setOpen(field, false);
    activeIndex[field] = -1;
    suggestions[field] = [];
  }
};

const selectSuggestion = (field: Field, suggestion: ThaiAddressSuggestion) => {
  if (!suggestion) {
    return;
  }

  values.subdistrict = suggestion.subdistrict;
  values.district = suggestion.district;
  values.province = suggestion.province;
  values.zipcode = suggestion.zipcode;
  emitModelValue();
  emit("select", { field, suggestion });
  closeAll();
};

const handleKeydown = (field: Field, event: KeyboardEvent) => {
  if (isDisabled.value) {
    return;
  }

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      moveActive(field, 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      moveActive(field, -1);
      break;
    case "Enter":
      if (isOpen[field] && activeIndex[field] >= 0) {
        event.preventDefault();
        selectSuggestion(field, suggestions[field][activeIndex[field]]);
      }
      break;
    case "Escape":
      event.preventDefault();
      setOpen(field, false);
      activeIndex[field] = -1;
      break;
    default:
      break;
  }
};

const optionKey = (
  field: Field,
  suggestion: ThaiAddressSuggestion,
  index: number,
) =>
  `${field}-${suggestion.zipcode}-${suggestion.subdistrict}-${suggestion.district}-${suggestion.province}-${index}`;

const showDropdown = (field: Field) =>
  isOpen[field] &&
  !isDisabled.value &&
  getQueryLength(field, values[field]) >= minChars.value;

onBeforeUnmount(() => {
  for (const field of fields) {
    if (debounceTimers[field]) {
      clearTimeout(debounceTimers[field]!);
      debounceTimers[field] = null;
    }
  }
});
</script>

<template>
  <div class="ta-fields" :class="{ disabled: isDisabled }">
    <div v-for="field in fields" :key="field" class="ta-field">
      <label v-if="shouldShowLabels" class="ta-label">
        {{ labelFor(field) }}
      </label>
      <input
        class="ta-input"
        type="text"
        :disabled="isDisabled"
        :placeholder="placeholderFor(field)"
        :value="values[field]"
        autocomplete="off"
        @input="handleInput(field, $event)"
        @focus="handleFocus(field)"
        @blur="handleBlur(field)"
        @keydown="handleKeydown(field, $event)" />
      <div v-if="showDropdown(field)" class="ta-dropdown">
        <ul v-if="suggestions[field].length" class="ta-list" role="listbox">
          <li
            v-for="(suggestion, index) in suggestions[field]"
            :key="optionKey(field, suggestion, index)"
            class="ta-option"
            :class="{ active: index === activeIndex[field] }"
            @mousedown.prevent="selectSuggestion(field, suggestion)"
            @mouseenter="activeIndex[field] = index">
            <slot
              name="option"
              :suggestion="suggestion"
              :index="index"
              :field="field">
              <span class="ta-option-text">
                {{ formatSuggestion(suggestion) }}
              </span>
            </slot>
          </li>
        </ul>
        <div v-else class="ta-no-results">
          <slot name="no-results" :field="field">No results</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ta-fields {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.ta-field {
  position: relative;
  width: 100%;
}

.ta-label {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #555555;
}

.ta-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.2;
  background: #ffffff;
}

.ta-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.ta-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  max-height: 240px;
  overflow: auto;
  z-index: 10;
}

.ta-list {
  list-style: none;
  margin: 0;
  padding: 6px 0;
}

.ta-option {
  padding: 8px 12px;
  cursor: pointer;
}

.ta-option.active {
  background: #f1f6ff;
}

.ta-option-text {
  display: block;
}

.ta-no-results {
  padding: 10px 12px;
  color: #666666;
  font-size: 13px;
}

.ta-fields.disabled .ta-input {
  background: #f5f5f5;
  cursor: not-allowed;
}
</style>
