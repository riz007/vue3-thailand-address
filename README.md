# vue3-thailand-address

Thai address autocomplete for Vue 3 with a headless search core, a composable, and a minimal UI component. Designed for SSR, Nuxt, and large datasets.

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

## Nuxt 3/4 notes

- The package is SSR-safe and does not access `window` or `document` at import time.
- Recommended patterns for large datasets:
  1. Load the dataset in a server plugin and provide it to the client (for example via `provide` or `useState`).
  2. Lazy import the dataset on the client inside `onMounted` or `if (process.client)` and pass it into the composable or component when ready.
  3. Prefer lazy-loading `@riz007/thai-address-data` to avoid SSR cold-start memory overhead.

## Migration from vue-thailand-address (Vue 2)

The Vue 2 package used a legacy row shape like `{ district, amphoe, province, zipcode }` where `district` meant subdistrict.
You can convert it with the adapter:

```ts
import { mapLegacyThailandAddressRows } from "vue3-thailand-address";

const rows = mapLegacyThailandAddressRows(legacyRows);
```
