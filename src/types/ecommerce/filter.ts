// ==============================|| ECOMMERCE - FILTER ||============================== //

export type TranslationsMap = Record<string, string | undefined>;

export interface Filter {
  id: number;
  name: string;
  dataType: string;
  partOfName?: boolean;
  filterable?: boolean;
  translationsMap?: TranslationsMap;
}

export interface FilterValue {
  id: number;
  value: string;
  data?: string;
  translationsMap?: TranslationsMap;
}
