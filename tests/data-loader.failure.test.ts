import { describe, expect, it, vi } from "vitest";
import { __internal, loadDefaultThaiAddressData } from "../src/data";

describe("loadDefaultThaiAddressData (missing)", () => {
  it("throws a clear error when optional dependency is missing", async () => {
    const error = new Error(
      "Cannot find module '@riz007/thai-address-data/data.json'",
    );
    (error as { code?: string }).code = "MODULE_NOT_FOUND";
    const spy = vi
      .spyOn(__internal, "importDefaultDataset")
      .mockRejectedValue(error);
    let message = "";

    try {
      await loadDefaultThaiAddressData();
    } catch (error) {
      if (error instanceof Error) {
        message = error.message;
      }
    }

    expect(message).toContain("@riz007/thai-address-data");
    spy.mockRestore();
  });
});
