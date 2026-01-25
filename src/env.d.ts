declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    any
  >;
  export default component;
}

declare module "@riz007/thai-address-data/data.json" {
  import type { ThaiAddressRow } from "./types";

  const data: ThaiAddressRow[];
  export default data;
}

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | number | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
