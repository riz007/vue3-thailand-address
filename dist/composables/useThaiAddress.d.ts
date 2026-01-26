import type { Ref } from "vue";
import type { ThaiAddressIndex, ThaiAddressSearchOptions } from "../core/search";
import type { ThaiAddressRow, ThaiAddressSuggestion } from "../types";
type MaybeRef<T> = T | Ref<T>;
export type UseThaiAddressOptions = {
    data: MaybeRef<ThaiAddressRow[] | ThaiAddressIndex>;
    limit?: MaybeRef<number | undefined>;
    minChars?: MaybeRef<number | undefined>;
    debounceMs?: MaybeRef<number | undefined>;
    format?: ThaiAddressSearchOptions["format"];
};
export declare function useThaiAddress(options: UseThaiAddressOptions): {
    query: Ref<string, string>;
    suggestions: Ref<{
        subdistrict: string;
        district: string;
        province: string;
        zipcode: string;
        formatted?: string | undefined;
    }[], ThaiAddressSuggestion[] | {
        subdistrict: string;
        district: string;
        province: string;
        zipcode: string;
        formatted?: string | undefined;
    }[]>;
    isOpen: Ref<boolean, boolean>;
    search: (nextQuery?: string) => ThaiAddressSuggestion[];
    clear: () => void;
    select: (suggestion: ThaiAddressSuggestion) => string;
};
export {};
