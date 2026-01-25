import { normalizeText } from "./normalize";
import type { ThaiAddressRow, ThaiAddressSuggestion } from "../types";

export type ThaiAddressIndex = {
  byZipcode: Map<string, ThaiAddressRow[]>;
  all: ThaiAddressRow[];
};

export type ThaiAddressSearchOptions = {
  limit?: number;
  format?: (row: ThaiAddressRow) => string;
};

type NormalizedRow = {
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
};

type IndexedRow = {
  row: ThaiAddressRow;
  normalized: NormalizedRow;
  index: number;
};

type IndexMeta = {
  entries: IndexedRow[];
  entryByRow: Map<ThaiAddressRow, IndexedRow>;
};

const indexMeta = new WeakMap<ThaiAddressIndex, IndexMeta>();

function normalizeZipcode(value: string): string {
  if (value == null) {
    return "";
  }

  return String(value).replace(/\D/g, "");
}

function coerceRow(
  row: ThaiAddressRow | null | undefined,
): ThaiAddressRow | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  return {
    subdistrict: row.subdistrict != null ? String(row.subdistrict).trim() : "",
    district: row.district != null ? String(row.district).trim() : "",
    province: row.province != null ? String(row.province).trim() : "",
    zipcode: row.zipcode != null ? String(row.zipcode).trim() : "",
  };
}

function buildIndexMeta(data: ThaiAddressRow[]): IndexMeta {
  const entries: IndexedRow[] = [];
  const entryByRow = new Map<ThaiAddressRow, IndexedRow>();

  data.forEach((item, index) => {
    const row = coerceRow(item);
    if (!row) {
      return;
    }

    const normalized: NormalizedRow = {
      subdistrict: normalizeText(row.subdistrict),
      district: normalizeText(row.district),
      province: normalizeText(row.province),
      zipcode: normalizeZipcode(row.zipcode),
    };

    const entry: IndexedRow = { row, normalized, index };
    entries.push(entry);
    entryByRow.set(row, entry);
  });

  return { entries, entryByRow };
}

function getIndexMeta(index: ThaiAddressIndex): IndexMeta {
  const cached = indexMeta.get(index);
  if (cached) {
    return cached;
  }

  const meta = buildIndexMeta(index.all || []);
  indexMeta.set(index, meta);
  return meta;
}

function startsWithAny(normalized: NormalizedRow, query: string): boolean {
  if (!query) {
    return false;
  }

  return (
    (normalized.subdistrict.length > 0 &&
      normalized.subdistrict.startsWith(query)) ||
    (normalized.district.length > 0 && normalized.district.startsWith(query)) ||
    (normalized.province.length > 0 && normalized.province.startsWith(query)) ||
    (normalized.zipcode.length > 0 && normalized.zipcode.startsWith(query))
  );
}

function includesAny(normalized: NormalizedRow, query: string): boolean {
  if (!query) {
    return false;
  }

  return (
    (normalized.subdistrict.length > 0 &&
      normalized.subdistrict.includes(query)) ||
    (normalized.district.length > 0 && normalized.district.includes(query)) ||
    (normalized.province.length > 0 && normalized.province.includes(query)) ||
    (normalized.zipcode.length > 0 && normalized.zipcode.includes(query))
  );
}

function toSuggestion(
  row: ThaiAddressRow,
  format?: (row: ThaiAddressRow) => string,
): ThaiAddressSuggestion {
  if (!format) {
    return row as ThaiAddressSuggestion;
  }

  return { ...row, formatted: format(row) };
}

function collectZipPrefixEntries(
  byZipcode: Map<string, ThaiAddressRow[]>,
  prefix: string,
  meta: IndexMeta,
): IndexedRow[] {
  const matches: IndexedRow[] = [];

  for (const [zipcode, rows] of byZipcode.entries()) {
    if (!zipcode.startsWith(prefix)) {
      continue;
    }

    for (const row of rows) {
      const entry = meta.entryByRow.get(row);
      if (entry) {
        matches.push(entry);
      }
    }
  }

  matches.sort((a, b) => a.index - b.index);
  return matches;
}

export function createThaiAddressIndex(
  data: ThaiAddressRow[],
): ThaiAddressIndex {
  const safeData = Array.isArray(data) ? data : [];
  const meta = buildIndexMeta(safeData);
  const byZipcode = new Map<string, ThaiAddressRow[]>();

  for (const entry of meta.entries) {
    const zipcode = entry.normalized.zipcode;
    if (!zipcode) {
      continue;
    }

    const list = byZipcode.get(zipcode);
    if (list) {
      list.push(entry.row);
    } else {
      byZipcode.set(zipcode, [entry.row]);
    }
  }

  const index: ThaiAddressIndex = {
    byZipcode,
    all: meta.entries.map((entry) => entry.row),
  };

  indexMeta.set(index, meta);
  return index;
}

export function searchThaiAddress(
  indexOrData: ThaiAddressIndex | ThaiAddressRow[],
  query: string,
  options: ThaiAddressSearchOptions = {},
): ThaiAddressSuggestion[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [];
  }

  const limit =
    typeof options.limit === "number" && Number.isFinite(options.limit)
      ? Math.max(0, options.limit)
      : Infinity;

  if (limit === 0) {
    return [];
  }

  const format = options.format;
  const isNumericQuery = /^\d+$/.test(normalizedQuery);
  const queryDigits = isNumericQuery
    ? normalizedQuery
    : normalizedQuery.replace(/\D/g, "");

  let meta: IndexMeta;
  let entries: IndexedRow[];
  let index: ThaiAddressIndex | null = null;

  if (Array.isArray(indexOrData)) {
    meta = buildIndexMeta(indexOrData);
    entries = meta.entries;
  } else if (indexOrData && typeof indexOrData === "object") {
    index = indexOrData;
    meta = getIndexMeta(index);
    entries = meta.entries;
  } else {
    return [];
  }

  const zipMatches: ThaiAddressSuggestion[] = [];
  const prefixMatches: ThaiAddressSuggestion[] = [];
  const containsMatches: ThaiAddressSuggestion[] = [];
  const seen = new Set<ThaiAddressRow>();

  if (isNumericQuery && index?.byZipcode && queryDigits) {
    const zipEntries = collectZipPrefixEntries(
      index.byZipcode,
      queryDigits,
      meta,
    );

    for (const entry of zipEntries) {
      zipMatches.push(toSuggestion(entry.row, format));
      seen.add(entry.row);

      if (zipMatches.length >= limit) {
        return zipMatches.slice(0, limit);
      }
    }
  }

  const shouldScanAll = !isNumericQuery || zipMatches.length < limit || !index;
  if (shouldScanAll) {
    for (const entry of entries) {
      if (seen.has(entry.row)) {
        continue;
      }

      const normalized = entry.normalized;

      if (
        isNumericQuery &&
        queryDigits &&
        normalized.zipcode.startsWith(queryDigits)
      ) {
        zipMatches.push(toSuggestion(entry.row, format));
        seen.add(entry.row);
        continue;
      }

      if (startsWithAny(normalized, normalizedQuery)) {
        prefixMatches.push(toSuggestion(entry.row, format));
        continue;
      }

      if (includesAny(normalized, normalizedQuery)) {
        containsMatches.push(toSuggestion(entry.row, format));
      }
    }
  }

  const combined = zipMatches.concat(prefixMatches, containsMatches);
  return combined.length > limit ? combined.slice(0, limit) : combined;
}

function asString(value: unknown): string {
  if (value == null) {
    return "";
  }

  return String(value).trim();
}

export function mapLegacyThailandAddressRows(input: unknown): ThaiAddressRow[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const mapped: ThaiAddressRow[] = [];

  for (const raw of input) {
    if (!raw || typeof raw !== "object") {
      continue;
    }

    const row = raw as Record<string, unknown>;
    const hasLegacyKeys = "amphoe" in row || "amphur" in row;

    const subdistrict = asString(
      hasLegacyKeys
        ? (row.district ?? row.tambon ?? row.subdistrict ?? row.sub_district)
        : (row.subdistrict ?? row.tambon ?? row.district ?? row.sub_district),
    );
    const district = asString(
      hasLegacyKeys
        ? (row.amphoe ?? row.amphur ?? row.district)
        : (row.district ?? row.amphoe ?? row.amphur),
    );
    const province = asString(row.province ?? row.changwat);
    const zipcode = asString(row.zipcode ?? row.zip ?? row.postcode);

    if (!subdistrict && !district && !province && !zipcode) {
      continue;
    }

    mapped.push({ subdistrict, district, province, zipcode });
  }

  return mapped;
}
