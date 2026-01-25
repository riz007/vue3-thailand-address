import type { ThaiAddressRow } from "./types";

const MISSING_DATASET_MESSAGE =
  'Optional dependency "@riz007/thai-address-data" is not installed. ' +
  "Install it or provide your own dataset via the data prop/composable option.";

const IMPORT_ERROR_PATTERN =
  /Cannot find module|Cannot find package|Failed to resolve|ERR_MODULE_NOT_FOUND|MODULE_NOT_FOUND/i;

export async function loadDefaultThaiAddressData(): Promise<ThaiAddressRow[]> {
  try {
    const module = await import("@riz007/thai-address-data/data.json");
    const data =
      (module as { default?: unknown }).default ??
      (module as unknown);

    if (!Array.isArray(data)) {
      throw new Error("Default dataset is not an array.");
    }

    return data as ThaiAddressRow[];
  } catch (error) {
    const code =
      typeof (error as { code?: unknown })?.code === "string"
        ? ((error as { code?: string }).code as string)
        : "";
    const isMissingModule =
      code === "ERR_MODULE_NOT_FOUND" ||
      code === "MODULE_NOT_FOUND" ||
      (error instanceof Error && IMPORT_ERROR_PATTERN.test(error.message));

    if (isMissingModule) {
      throw new Error(MISSING_DATASET_MESSAGE);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(MISSING_DATASET_MESSAGE);
  }
}
