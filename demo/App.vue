<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  ThaiAddressAutocomplete,
  ThaiAddressFields,
  loadDefaultThaiAddressData,
} from "vue3-thailand-address";
import type {
  ThaiAddressRow,
  ThaiAddressSuggestion,
} from "vue3-thailand-address";

const model = ref("");
const fieldsModel = ref<ThaiAddressRow>({
  subdistrict: "",
  district: "",
  province: "",
  zipcode: "",
});
const data = ref<ThaiAddressRow[]>([]);
const status = ref("Loading dataset...");
const lastSelected = ref<ThaiAddressSuggestion | null>(null);
const lastSelectedFields = ref<ThaiAddressSuggestion | null>(null);
const lastSelectedField = ref<keyof ThaiAddressRow | null>(null);

const fallbackData: ThaiAddressRow[] = [
  {
    subdistrict: "Pathum Wan",
    district: "Pathum Wan",
    province: "Bangkok",
    zipcode: "10330",
  },
  {
    subdistrict: "Suan Luang",
    district: "Suan Luang",
    province: "Bangkok",
    zipcode: "10250",
  },
  {
    subdistrict: "Mae Hia",
    district: "Mueang Chiang Mai",
    province: "Chiang Mai",
    zipcode: "50100",
  },
];

onMounted(async () => {
  try {
    const rows = await loadDefaultThaiAddressData();
    data.value = rows;
    status.value = "Loaded default dataset.";
  } catch {
    data.value = fallbackData;
    status.value = "Default dataset not installed. Using fallback sample rows.";
  }
});

const handleSelect = (suggestion: ThaiAddressSuggestion) => {
  lastSelected.value = suggestion;
};

const handleSelectFields = (payload: {
  field: keyof ThaiAddressRow;
  suggestion: ThaiAddressSuggestion;
}) => {
  lastSelectedField.value = payload.field;
  lastSelectedFields.value = payload.suggestion;
};
</script>

<template>
  <div class="demo">
    <header class="demo-header">
      <h1>vue3-thailand-address demo</h1>
      <p class="demo-status">{{ status }}</p>
    </header>

    <section class="demo-panel">
      <ThaiAddressAutocomplete
        v-model="model"
        :data="data"
        :min-chars="2"
        :limit="8"
        placeholder="Start typing an address..."
        @select="handleSelect">
        <template #option="{ suggestion }">
          <div class="demo-option">
            <strong>{{ suggestion.subdistrict }}</strong>
            <span>
              / {{ suggestion.district }} / {{ suggestion.province }}
            </span>
            <span class="demo-zip">{{ suggestion.zipcode }}</span>
          </div>
        </template>
      </ThaiAddressAutocomplete>
    </section>

    <section class="demo-panel">
      <h2>Selected</h2>
      <pre class="demo-output">{{ lastSelected }}</pre>
    </section>

    <section class="demo-panel">
      <h2>Multi-field</h2>
      <ThaiAddressFields
        v-model="fieldsModel"
        :data="data"
        :min-chars="2"
        :limit="6"
        @select="handleSelectFields" />
    </section>

    <section class="demo-panel">
      <h2>Selected (multi-field)</h2>
      <p class="demo-note">Last picked from: {{ lastSelectedField ?? "-" }}</p>
      <pre class="demo-output">{{ lastSelectedFields }}</pre>
      <p class="demo-note">Current model:</p>
      <pre class="demo-output">{{ fieldsModel }}</pre>
    </section>
  </div>
</template>

<style scoped>
.demo {
  max-width: 720px;
  margin: 40px auto;
  padding: 0 16px;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: #1f2937;
}

.demo-header {
  margin-bottom: 24px;
}

.demo-status {
  margin: 4px 0 0;
  color: #4b5563;
}

.demo-panel {
  margin-bottom: 24px;
}

.demo-option {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.demo-zip {
  color: #2563eb;
  font-weight: 600;
}

.demo-output {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  min-height: 60px;
  white-space: pre-wrap;
}

.demo-note {
  margin: 6px 0;
  color: #6b7280;
  font-size: 13px;
}
</style>
