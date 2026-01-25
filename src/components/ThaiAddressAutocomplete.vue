<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { createThaiAddressIndex, searchThaiAddress } from "../core/search";
import type { ThaiAddressIndex } from "../core/search";
import type { ThaiAddressRow, ThaiAddressSuggestion } from "../types";

type Emits = {
  (e: "update:modelValue", value: string): void;
  (e: "select", value: ThaiAddressSuggestion): void;
  (e: "open"): void;
  (e: "close"): void;
};

const props = defineProps<{
  modelValue: string;
  data: ThaiAddressRow[];
  limit?: number;
  minChars?: number;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  clearOnSelect?: boolean;
  formatInput?: (suggestion: ThaiAddressSuggestion) => string;
}>();

const emit = defineEmits<Emits>();

const query = ref(props.modelValue ?? "");
const suggestions = ref<ThaiAddressSuggestion[]>([]);
const isOpen = ref(false);
const activeIndex = ref(-1);
const indexRef = shallowRef<ThaiAddressIndex | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const limit = computed(() => props.limit ?? 10);
const minChars = computed(() => props.minChars ?? 2);
const debounceMs = computed(() => props.debounceMs ?? 150);
const isDisabled = computed<boolean>(() => !!props.disabled);
const shouldClearOnSelect = computed<boolean>(() => !!props.clearOnSelect);

const showDropdown = computed(
  () =>
    isOpen.value && !isDisabled.value && query.value.length >= minChars.value,
);

const formatSuggestion = (suggestion: ThaiAddressSuggestion) =>
  `${suggestion.subdistrict}, ${suggestion.district}, ${suggestion.province} ${suggestion.zipcode}`.trim();

const setOpen = (next: boolean) => {
  if (isOpen.value === next) {
    return;
  }

  isOpen.value = next;
  emit(next ? "open" : "close");
};

const updateIndex = (data: ThaiAddressRow[] | null | undefined) => {
  indexRef.value = createThaiAddressIndex(data ?? []);
};

const runSearch = (
  value: string,
  openOnEmpty = true,
): ThaiAddressSuggestion[] => {
  if (isDisabled.value || value.length < minChars.value) {
    suggestions.value = [];
    activeIndex.value = -1;
    setOpen(false);
    return [];
  }

  const index = indexRef.value ?? createThaiAddressIndex(props.data ?? []);
  const results = searchThaiAddress(index, value, { limit: limit.value });
  suggestions.value = results;
  activeIndex.value = results.length > 0 ? 0 : -1;
  setOpen(openOnEmpty ? true : results.length > 0);
  return results;
};

const scheduleSearch = (value: string) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  const delay = debounceMs.value;
  if (delay <= 0) {
    runSearch(value, true);
    return;
  }

  debounceTimer = setTimeout(() => {
    runSearch(value, true);
    debounceTimer = null;
  }, delay);
};

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  query.value = value;
  emit("update:modelValue", value);
  scheduleSearch(value);
};

const handleFocus = () => {
  if (isDisabled.value) {
    return;
  }

  if (query.value.length >= minChars.value) {
    if (suggestions.value.length > 0) {
      setOpen(true);
    } else {
      runSearch(query.value, false);
    }
  }
};

const handleBlur = () => {
  setOpen(false);
  activeIndex.value = -1;
};

const moveActive = (direction: 1 | -1) => {
  if (!suggestions.value.length) {
    return;
  }

  if (!showDropdown.value) {
    setOpen(true);
  }

  const nextIndex = activeIndex.value + direction;
  if (nextIndex < 0) {
    activeIndex.value = suggestions.value.length - 1;
  } else if (nextIndex >= suggestions.value.length) {
    activeIndex.value = 0;
  } else {
    activeIndex.value = nextIndex;
  }
};

const selectSuggestion = (suggestion: ThaiAddressSuggestion) => {
  if (!suggestion) {
    return;
  }

  emit("select", suggestion);
  const formatted = props.formatInput
    ? props.formatInput(suggestion)
    : formatSuggestion(suggestion);
  const nextValue = shouldClearOnSelect.value ? "" : formatted;
  query.value = nextValue;
  emit("update:modelValue", nextValue);
  suggestions.value = [];
  activeIndex.value = -1;
  setOpen(false);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (isDisabled.value) {
    return;
  }

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      moveActive(1);
      break;
    case "ArrowUp":
      event.preventDefault();
      moveActive(-1);
      break;
    case "Enter":
      if (showDropdown.value && activeIndex.value >= 0) {
        event.preventDefault();
        selectSuggestion(suggestions.value[activeIndex.value]);
      }
      break;
    case "Escape":
      event.preventDefault();
      setOpen(false);
      activeIndex.value = -1;
      break;
    default:
      break;
  }
};

const optionKey = (suggestion: ThaiAddressSuggestion, index: number) =>
  `${suggestion.zipcode}-${suggestion.subdistrict}-${suggestion.district}-${suggestion.province}-${index}`;

watch(
  () => props.modelValue,
  (value) => {
    const nextValue = value ?? "";
    if (nextValue !== query.value) {
      query.value = nextValue;
      if (nextValue.length >= minChars.value) {
        scheduleSearch(nextValue);
      } else {
        suggestions.value = [];
        setOpen(false);
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.data,
  (data: ThaiAddressRow[] | null | undefined) => {
    updateIndex(data);
    if (isOpen.value && query.value.length >= minChars.value) {
      runSearch(query.value, true);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
});
</script>

<template>
  <div class="ta-autocomplete" :class="{ disabled: isDisabled }">
    <input
      ref="inputRef"
      class="ta-input"
      type="text"
      :disabled="isDisabled"
      :placeholder="placeholder"
      :value="query"
      autocomplete="off"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown" />
    <div v-if="showDropdown" class="ta-dropdown">
      <ul v-if="suggestions.length" class="ta-list" role="listbox">
        <li
          v-for="(suggestion, index) in suggestions"
          :key="optionKey(suggestion, index)"
          class="ta-option"
          :class="{ active: index === activeIndex }"
          @mousedown.prevent="selectSuggestion(suggestion)"
          @mouseenter="activeIndex = index">
          <slot name="option" :suggestion="suggestion" :index="index">
            <span class="ta-option-text">
              {{ formatSuggestion(suggestion) }}
            </span>
          </slot>
        </li>
      </ul>
      <div v-else class="ta-no-results">
        <slot name="no-results">No results</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ta-autocomplete {
  position: relative;
  width: 100%;
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

.ta-autocomplete.disabled .ta-input {
  background: #f5f5f5;
  cursor: not-allowed;
}
</style>
