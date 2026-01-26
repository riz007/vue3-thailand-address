import type { ThaiAddressRow, ThaiAddressSuggestion } from "../types";
type __VLS_Props = {
    modelValue: string;
    data: ThaiAddressRow[];
    limit?: number;
    minChars?: number;
    debounceMs?: number;
    placeholder?: string;
    disabled?: boolean;
    clearOnSelect?: boolean;
    formatInput?: (suggestion: ThaiAddressSuggestion) => string;
};
declare var __VLS_1: {
    suggestion: {
        subdistrict: string;
        district: string;
        province: string;
        zipcode: string;
        formatted?: string | undefined;
    };
    index: number;
}, __VLS_3: {};
type __VLS_Slots = {} & {
    option?: (props: typeof __VLS_1) => any;
} & {
    'no-results'?: (props: typeof __VLS_3) => any;
};
declare const __VLS_base: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:modelValue": (value: string) => any;
    select: (value: ThaiAddressSuggestion) => any;
    open: () => any;
    close: () => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
    onSelect?: ((value: ThaiAddressSuggestion) => any) | undefined;
    onOpen?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
