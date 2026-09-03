export const productCategories = [
  "veladores",
  "kits",
  "souvenirs",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export const productCategoryLabels: Record<ProductCategory, string> = {
  veladores: "Veladores",
  kits: "Kits",
  souvenirs: "Souvenirs",
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ProductCategory;
  tag: string;
  alt: string;
  image: string;
  images: string[];
  material: string;
  finish: string;
  customizable: boolean;
  featured: boolean;
  available: boolean;
  stock: number | null;
  price: number | null;
  currency: "ARS";
  searchText: string;
  instagramUrl: string;
  mercadoLibreUrl: string;
};

export type ProductDocument = Omit<Product, "id"> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProductInput = {
  title: string;
  description: string;
  category: ProductCategory;
  tag: string;
  alt: string;
  material: string;
  finish: string;
  customizable: boolean;
  featured: boolean;
  available: boolean;
  stock: number | null;
  price: number | null;
  instagramUrl: string;
  mercadoLibreUrl: string;
};
