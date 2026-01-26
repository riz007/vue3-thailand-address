# vue3-thailand-address

Thai address autocomplete for Vue 3 with a headless search core, a composable, and a minimal UI component. Designed for SSR, Nuxt, and large datasets.

**Live demo:** [https://riz007.github.io/vue3-thailand-address/](https://riz007.github.io/vue3-thailand-address/)

## Installation

```bash
npm install vue3-thailand-address
```

```bash
yarn add vue3-thailand-address
```

```bash
pnpm add vue3-thailand-address
```

## Basic component usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ThaiAddressAutocomplete } from "vue3-thailand-address";
import type { ThaiAddressRow } from "vue3-thailand-address";

const model = ref("");
const data: ThaiAddressRow[] = [
  {
    subdistrict: "Pathum Wan",
    district: "Pathum Wan",
    province: "Bangkok",
    zipcode: "10330",
  },
];
</script>

<template>
  <ThaiAddressAutocomplete v-model="model" :data="data" />
</template>
```

Slots:

```vue
<ThaiAddressAutocomplete v-model="model" :data="data">
  <template #option="{ suggestion }">
    <strong>{{ suggestion.subdistrict }}</strong>
    <span> / {{ suggestion.district }} / {{ suggestion.province }}</span>
  </template>
  <template #no-results>No matches</template>
</ThaiAddressAutocomplete>
```

## Composable usage

```ts
import { useThaiAddress } from "vue3-thailand-address";

const { query, suggestions, isOpen, search, select, clear } = useThaiAddress({
  data,
  minChars: 2,
  debounceMs: 150,
  limit: 10,
});

function onInput(value: string) {
  query.value = value;
  search();
}
```

## Multi-field usage

This component provides four linked inputs (subdistrict, district, province, zipcode).
Selecting a suggestion fills all fields.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ThaiAddressFields } from "vue3-thailand-address";
import type { ThaiAddressRow } from "vue3-thailand-address";

const model = ref<ThaiAddressRow>({
  subdistrict: "",
  district: "",
  province: "",
  zipcode: "",
});
</script>

<template>
  <ThaiAddressFields v-model="model" :data="data" />
</template>
```

## Core search

```ts
import {
  createThaiAddressIndex,
  searchThaiAddress,
} from "vue3-thailand-address";

const index = createThaiAddressIndex(data);
const results = searchThaiAddress(index, "101", { limit: 10 });
```

## Dataset format

```ts
type ThaiAddressRow = {
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
};
```

Zipcode is treated as a string during search (numeric inputs are coerced).

## Optional default dataset

This library is dataset-agnostic by default. You can either:

- Pass your own dataset into the component/composable, or
- Install the optional dataset package and load it on demand.

Install the dataset:

```bash
yarn add @riz007/thai-address-data
# or npm install @riz007/thai-address-data
```

Then load it lazily when you need it:

```ts
import { loadDefaultThaiAddressData } from "vue3-thailand-address";

const data = await loadDefaultThaiAddressData();
```

If you only want the dataset loader entrypoint, you can also import:

```ts
import { loadDefaultThaiAddressData } from "vue3-thailand-address/data";
```

## Local demo (browser)

Run the demo app to test the component in a browser:

```bash
yarn dev:demo
```

The demo tries to load `@riz007/thai-address-data` via `loadDefaultThaiAddressData()`. If the optional dataset is not installed, it falls back to a small sample dataset.

## เดโมบนเบราว์เซอร์ (ภาษาไทย)

เดโม: [https://riz007.github.io/vue3-thailand-address/](https://riz007.github.io/vue3-thailand-address/)

ต้องการทดลองใช้งานบนเบราว์เซอร์อย่างรวดเร็ว สามารถรันเดโมได้ด้วยคำสั่ง:

```bash
yarn dev:demo
```

เดโมจะพยายามโหลดชุดข้อมูลจาก `@riz007/thai-address-data` ผ่าน `loadDefaultThaiAddressData()` หากไม่ได้ติดตั้งแพ็กเกจดังกล่าว ระบบจะใช้ชุดข้อมูลตัวอย่างขนาดเล็กแทนเพื่อให้ทดสอบได้ทันที

## Nuxt 3/4 notes

- The package is SSR-safe and does not access `window` or `document` at import time.
- Recommended patterns for large datasets:
  1. Load the dataset in a server plugin and provide it to the client (for example via `provide` or `useState`).
  2. Lazy import the dataset on the client inside `onMounted` or `if (process.client)` and pass it into the composable or component when ready.
  3. Prefer lazy-loading `@riz007/thai-address-data` to avoid SSR cold-start memory overhead.

## Vue 3 / Nuxt usage & customization (English)

### 1) Vue 3 basic usage

Use the ready-made UI components:

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  ThaiAddressAutocomplete,
  ThaiAddressFields,
  loadDefaultThaiAddressData,
} from "vue3-thailand-address";
import type { ThaiAddressRow } from "vue3-thailand-address";

const query = ref("");
const model = ref<ThaiAddressRow>({
  subdistrict: "",
  district: "",
  province: "",
  zipcode: "",
});
const data = ref<ThaiAddressRow[]>([]);

onMounted(async () => {
  try {
    data.value = await loadDefaultThaiAddressData();
  } catch {
    data.value = [];
  }
});
</script>

<template>
  <ThaiAddressAutocomplete v-model="query" :data="data" />
  <ThaiAddressFields v-model="model" :data="data" />
</template>
```

If you prefer full UI control, use the composable:

```ts
const { query, suggestions, search, select } = useThaiAddress({
  data,
  minChars: 2,
  debounceMs: 150,
  limit: 10,
});
```

### 2) Nuxt 3 / 4 usage (SSR-friendly)

Recommended: load the dataset once in a plugin and reuse it everywhere.

`plugins/thai-address-data.ts`

```ts
import { loadDefaultThaiAddressData } from "vue3-thailand-address";
import type { ThaiAddressRow } from "vue3-thailand-address";

export default defineNuxtPlugin(async () => {
  const state = useState<ThaiAddressRow[]>("thaiAddressData", () => []);
  if (state.value.length) {
    return;
  }

  try {
    state.value = await loadDefaultThaiAddressData();
  } catch {
    state.value = [];
  }
});
```

Then in any component:

```ts
const data = useState<ThaiAddressRow[]>("thaiAddressData");
```

### 3) Customization details

Data:

- The library is dataset-agnostic. Provide your own rows in the shape:
  `{ subdistrict, district, province, zipcode }`.
- If you have legacy data from the Vue 2 package, convert it with:
  `mapLegacyThailandAddressRows(legacyRows)`.

Search:

- `minChars`, `debounceMs`, and `limit` are available in both
  `ThaiAddressAutocomplete` and `ThaiAddressFields`.
- Zipcode queries are optimized and prioritized for numeric input.
- Use `searchThaiAddress` directly if you want custom ranking or filters.

UI:

- `ThaiAddressAutocomplete` exposes slots: `option`, `no-results`.
- You can control the input text with `formatInput` or in the composable with
  `format`.
- `ThaiAddressFields` provides `labels`, `placeholders`, `showLabels`, and
  `disabled` props, plus a `select` event that returns the chosen suggestion.

Frameworks / UI libraries:

- For UI libraries (Vuetify, Element Plus, Naive UI, etc.), use the composable
  to wire suggestions into their input components.
- For SSR (Nuxt), lazy-load large datasets to keep server cold starts small.

## วิธีใช้กับ Vue 3 / Nuxt และการปรับแต่ง (ภาษาไทย)

### 1) ใช้กับ Vue 3 แบบพื้นฐาน

ใช้คอมโพเนนต์ที่มีให้ได้ทันที:

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  ThaiAddressAutocomplete,
  ThaiAddressFields,
  loadDefaultThaiAddressData,
} from "vue3-thailand-address";
import type { ThaiAddressRow } from "vue3-thailand-address";

const query = ref("");
const model = ref<ThaiAddressRow>({
  subdistrict: "",
  district: "",
  province: "",
  zipcode: "",
});
const data = ref<ThaiAddressRow[]>([]);

onMounted(async () => {
  try {
    data.value = await loadDefaultThaiAddressData();
  } catch {
    data.value = [];
  }
});
</script>

<template>
  <ThaiAddressAutocomplete v-model="query" :data="data" />
  <ThaiAddressFields v-model="model" :data="data" />
</template>
```

ถ้าต้องการควบคุม UI เองทั้งหมด ใช้ composable:

```ts
const { query, suggestions, search, select } = useThaiAddress({
  data,
  minChars: 2,
  debounceMs: 150,
  limit: 10,
});
```

### 2) ใช้กับ Nuxt 3 / 4 (รองรับ SSR)

แนะนำให้โหลดข้อมูลครั้งเดียวใน plugin แล้วใช้ซ้ำทุกหน้า:

`plugins/thai-address-data.ts`

```ts
import { loadDefaultThaiAddressData } from "vue3-thailand-address";
import type { ThaiAddressRow } from "vue3-thailand-address";

export default defineNuxtPlugin(async () => {
  const state = useState<ThaiAddressRow[]>("thaiAddressData", () => []);
  if (state.value.length) {
    return;
  }

  try {
    state.value = await loadDefaultThaiAddressData();
  } catch {
    state.value = [];
  }
});
```

จากนั้นในคอมโพเนนต์:

```ts
const data = useState<ThaiAddressRow[]>("thaiAddressData");
```

### 3) รายละเอียดการปรับแต่ง

ข้อมูล (Dataset):

- ไลบรารีนี้ไม่บังคับชุดข้อมูล คุณสามารถส่งข้อมูลของคุณเองได้ในรูปแบบ
  `{ subdistrict, district, province, zipcode }`.
- หากมีข้อมูลจากแพ็กเกจ Vue 2 เดิม ให้แปลงด้วย
  `mapLegacyThailandAddressRows(legacyRows)`.

การค้นหา:

- ปรับ `minChars`, `debounceMs`, `limit` ได้ทั้งใน
  `ThaiAddressAutocomplete` และ `ThaiAddressFields`.
- คิวรีตัวเลข (รหัสไปรษณีย์) จะถูกจัดลำดับความสำคัญก่อน.
- ใช้ `searchThaiAddress` ได้โดยตรงหากต้องการ filter หรือจัดอันดับเอง.

UI:

- `ThaiAddressAutocomplete` มีสล็อต `option`, `no-results`.
- กำหนดรูปแบบข้อความในช่อง input ด้วย `formatInput` หรือใน composable ด้วย
  `format`.
- `ThaiAddressFields` รองรับ `labels`, `placeholders`, `showLabels`,
  `disabled` และมี event `select` ให้ผลลัพธ์ที่เลือก.

การทำงานร่วมกับ UI library:

- หากใช้ Vuetify, Element Plus, Naive UI ฯลฯ แนะนำให้ใช้ composable
  เพื่อผูกผลลัพธ์กับคอมโพเนนต์ของไลบรารีนั้นๆ ได้ตรงตามดีไซน์.
- สำหรับ SSR (Nuxt) ควร lazy-load ชุดข้อมูลเพื่อไม่ให้เซิร์ฟเวอร์เริ่มต้นช้า.

## Migration from vue-thailand-address (Vue 2)

The Vue 2 package used a legacy row shape like `{ district, amphoe, province, zipcode }` where `district` meant subdistrict.
You can convert it with the adapter:

```ts
import { mapLegacyThailandAddressRows } from "vue3-thailand-address";

const rows = mapLegacyThailandAddressRows(legacyRows);
```
