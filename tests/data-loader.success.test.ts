import { describe, expect, it, vi } from "vitest";
import { __internal, loadDefaultThaiAddressData } from "../src/data";

const mockRow = {
  subdistrict: "Pathum Wan",
  district: "Pathum Wan",
  province: "Bangkok",
  zipcode: "10330",
};

describe("loadDefaultThaiAddressData (available)", () => {
  it("returns an array when the dataset module is available", async () => {
    const spy = vi
      .spyOn(__internal, "importDefaultDataset")
      .mockResolvedValue({ default: [mockRow] });
    const data = await loadDefaultThaiAddressData();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    spy.mockRestore();
  });
});
