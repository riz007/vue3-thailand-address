declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    any
  >;
  export default component;
}

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | number | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
