"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  galleryCategories,
  topicLabel,
  type GalleryCategoryId,
} from "@/types/product";

type ProductOption = {
  value: string;
  label: string;
};

type GalleryFiltersProps = {
  selectedCategory: string;
  selectedProduct: string;
  selectedTopic?: string;
  products: ProductOption[];
  topics: string[];
  visibleCount: number;
  onCategoryChange: (category: GalleryCategoryId) => void;
  onProductChange: (product: string) => void;
  onTopicChange: (topic: string) => void;
};

export function GalleryFilters({
  selectedCategory,
  selectedProduct,
  selectedTopic = "",
  products,
  topics,
  visibleCount,
  onCategoryChange,
  onProductChange,
  onTopicChange,
}: GalleryFiltersProps) {
  const countLabel =
    visibleCount === 1
      ? "Mostrando 1 producto"
      : `Mostrando ${visibleCount} productos`;

  return (
    <section className="px-container-margin pb-md flex flex-col gap-md">
      <div className="overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-sm">
        {galleryCategories.map((item) => {
          const active = item.id === selectedCategory;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCategoryChange(item.id)}
              className={
                active
                  ? "px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps transition-colors"
                  : "px-4 py-2 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1" style={{ width: "100%" }}>
        <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
          Producto
        </span>
        <SearchableSelect
          value={selectedProduct}
          onChange={onProductChange}
          placeholder="Todos los productos"
          searchPlaceholder="Buscar producto..."
          emptyMessage="No hay productos con esa búsqueda"
          options={[
            { value: "", label: "Todos los productos" },
            ...products,
          ]}
        />
      </div>

      {topics.length > 0 ? (
        <div className="flex flex-col gap-1" style={{ width: "100%" }}>
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
            Temática / Uso
          </span>
          <SearchableSelect
            value={selectedTopic}
            onChange={onTopicChange}
            placeholder="Todas las temáticas"
            searchPlaceholder="Buscar temática..."
            emptyMessage="No hay temáticas con esa búsqueda"
            options={[
              { value: "", label: "Todas las temáticas" },
              ...topics.map((topic) => ({
                value: topic,
                label: topicLabel(topic),
              })),
            ]}
          />
        </div>
      ) : null}

      <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
        {countLabel}
      </p>
    </section>
  );
}
