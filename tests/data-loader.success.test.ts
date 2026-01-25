import { describe, expect, it, vi } from "vitest";
import { loadDefaultThaiAddressData } from "../src/data";

vi.mock(
  "@riz007/thai-address-data/data.json",
  () => ({
    default: [
      {
        subdistrict: "Pathum Wan",
        district: "Pathum Wan",
        province: "Bangkok",
        zipcode: "10330",
      },
    ],
  }),
  { virtual: true },
);

describe("loadDefaultThaiAddressData (available)", () => {
  it("returns an array when the dataset module is available", async () => {
    const data = await loadDefaultThaiAddressData();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
  });
});
