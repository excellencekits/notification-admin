// ==============================|| E-COMMERCE TYPES - ITEM ||============================== //

export type TranslationsMap = Record<string, string | undefined>;

export interface ImageVariants {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
}

export interface ItemDTO {
  id: number;
  name: string;
  product: boolean;
  categoryId: number;
  categoryName: string;
  description?: string;
  thumbnail?: ImageVariants;
  active?: boolean;
  subCategories: ItemDTO[];
  sibling: ItemDTO[];
  owner: boolean;
  inStock?: boolean;
  translationsMap?: TranslationsMap;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  thumbnail?: ImageVariants;
  categoryId: number;
  categoryName: string;
  featured?: boolean;
  active?: boolean;
  product?: boolean;
  description?: string;
  subCategories?: Category[];
}

export interface ProductDTO {
  id: number;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  categoryId: number;
  categoryName: string;
  thumbnail?: ImageVariants;
  images?: ImageVariants[];
  active: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemImage {
  id: number;
  itemId: number;
  url: string;
  thumbnail?: ImageVariants;
  order?: number;
}

export interface ItemFilter {
  id: number;
  name: string;
  type: string;
  values: FilterValue[];
}

export interface FilterValue {
  id: number;
  value: string;
  label: string;
}

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
  createdAt?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
