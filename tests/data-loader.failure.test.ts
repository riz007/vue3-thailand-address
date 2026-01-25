import { describe, expect, it, vi } from "vitest";
import { loadDefaultThaiAddressData } from "../src/data";

vi.mock(
  "@riz007/thai-address-data/data.json",
  () => {
    throw new Error("Cannot find module '@riz007/thai-address-data/data.json'");
  },
  { virtual: true },
);

describe("loadDefaultThaiAddressData (missing)", () => {
  it("throws a clear error when optional dependency is missing", async () => {
    let message = "";

    try {
      await loadDefaultThaiAddressData();
    } catch (error) {
      if (error instanceof Error) {
        message = error.message;
      }
    }

    expect(message).toContain("@riz007/thai-address-data");
  });
});
