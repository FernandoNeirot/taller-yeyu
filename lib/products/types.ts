export const productCategories = [
  "iluminacion",
  "kits",
  "souvenirs",
] as const;

export type ProductCategory = (typeof productCategories)[number];

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
};

export type ProductDocument = Omit<Product, "id"> & {
  createdAt?: Date;
  updatedAt?: Date;
};
