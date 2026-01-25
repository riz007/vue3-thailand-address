export type ThaiAddressRow = {
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
};

export type ThaiAddress = ThaiAddressRow;

export type ThaiAddressSuggestion = ThaiAddressRow & {
  formatted?: string;
};
