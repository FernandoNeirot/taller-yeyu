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
      <div className="hide-scrollbar flex snap-x snap-mandatory items-center gap-2 overflow-x-auto">
        {galleryCategories.map((item) => {
          const active = item.id === selectedCategory;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCategoryChange(item.id)}
              className={
                active
                  ? "touch-target snap-start shrink-0 whitespace-nowrap rounded-full bg-primary-container px-4 font-label-caps text-label-caps text-on-primary-container transition-colors"
                  : "touch-target snap-start shrink-0 whitespace-nowrap rounded-full border border-outline-variant bg-surface-container px-4 font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
              }
            >
              {item.label}
            </button>
          );
        })}
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
