import { describe, expect, it } from "vitest";
import { normalizeText } from "../src/core/normalize";
import { searchThaiAddress } from "../src/core/search";
import { useThaiAddress } from "../src/composables/useThaiAddress";
import type { ThaiAddressRow } from "../src/types";

describe("normalizeText", () => {
  it("normalizes whitespace and casing", () => {
    expect(normalizeText("  BangKok   Noi ")).toBe("bangkok noi");
  });
});

describe("searchThaiAddress ranking", () => {
  it("prefers zipcode prefix over field prefix and contains", () => {
    const data: ThaiAddressRow[] = [
      {
        subdistrict: "10 Town",
        district: "Alpha",
        province: "Beta",
        zipcode: "99999",
      },
      {
        subdistrict: "Gamma",
        district: "Delta",
        province: "Epsilon",
        zipcode: "10120",
      },
      {
        subdistrict: "Sigma",
        district: "Theta",
        province: "Iota",
        zipcode: "31000",
      },
    ];

    const results = searchThaiAddress(data, "10", { limit: 10 });
    expect(results[0].zipcode).toBe("10120");
    expect(results[1].subdistrict).toBe("10 Town");
    expect(results[2].zipcode).toBe("31000");
  });

  it("keeps stable order for equivalent matches", () => {
    const data: ThaiAddressRow[] = [
      {
        subdistrict: "Alpha",
        district: "District A",
        province: "Province",
        zipcode: "10000",
      },
      {
        subdistrict: "Alpha",
        district: "District B",
        province: "Province",
        zipcode: "10001",
      },
    ];

    const results = searchThaiAddress(data, "alpha", { limit: 10 });
    expect(results.map((row) => row.zipcode)).toEqual(["10000", "10001"]);
  });
});

describe("useThaiAddress", () => {
  it("does not search under minChars", () => {
    const data: ThaiAddressRow[] = [
      {
        subdistrict: "Alpha",
        district: "District",
        province: "Province",
        zipcode: "10000",
      },
    ];

    const { suggestions, search } = useThaiAddress({
      data,
      minChars: 3,
      debounceMs: 0,
    });

    search("al");
    expect(suggestions.value).toHaveLength(0);

    search("alp");
    expect(suggestions.value).toHaveLength(1);
  });
});
