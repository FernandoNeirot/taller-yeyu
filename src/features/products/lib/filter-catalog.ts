import type { Product } from "@/types/product";

export function filterCatalogProducts(
  products: Product[],
  {
    selectedCategory,
    selectedTopic,
    selectedProduct,
  }: {
    selectedCategory: string;
    selectedTopic?: string;
    selectedProduct?: string;
  },
) {
  return products.filter((product) => {
    if (!product.isActive) {
      return false;
    }

    if (
      selectedCategory !== "todos" &&
      !product.categories.includes(selectedCategory)
    ) {
      return false;
    }

    if (selectedTopic && !product.topics.includes(selectedTopic)) {
      return false;
    }

    if (
      selectedProduct &&
      product.id !== selectedProduct &&
      product.slug !== selectedProduct
    ) {
      return false;
    }

    return true;
  });
}
