import type { ThaiAddressRow, ThaiAddressSuggestion } from "../types";
export type ThaiAddressIndex = {
    byZipcode: Map<string, ThaiAddressRow[]>;
    all: ThaiAddressRow[];
};
export type ThaiAddressSearchOptions = {
    limit?: number;
    format?: (row: ThaiAddressRow) => string;
};
export declare function createThaiAddressIndex(data: ThaiAddressRow[]): ThaiAddressIndex;
export declare function searchThaiAddress(indexOrData: ThaiAddressIndex | ThaiAddressRow[], query: string, options?: ThaiAddressSearchOptions): ThaiAddressSuggestion[];
export declare function mapLegacyThailandAddressRows(input: unknown): ThaiAddressRow[];
