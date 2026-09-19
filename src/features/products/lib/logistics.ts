import type { Product } from "@/types/product";
import { getProductMeasures } from "./measures";

export type PackageSize = {
  heightCm: number;
  widthCm: number;
  lengthCm: number;
};

export const DEFAULT_WEIGHT_GRAMS = 350;
export const DEFAULT_THICKNESS_CM = 3;
export const STANDARD_MAX_SIDE_CM = 50;
export const STANDARD_MAX_WEIGHT_GRAMS = 5000;

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseDimensionString(value: string): PackageSize | null {
  const nums = [...value.matchAll(/(\d+(?:[.,]\d+)?)/g)]
    .map((match) => Number(match[1].replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (nums.length >= 3) {
    return { lengthCm: nums[0], widthCm: nums[1], heightCm: nums[2] };
  }
  if (nums.length === 2) {
    return {
      lengthCm: nums[0],
      widthCm: nums[1],
      heightCm: DEFAULT_THICKNESS_CM,
    };
  }
  if (nums.length === 1) {
    return {
      lengthCm: nums[0],
      widthCm: nums[0],
      heightCm: DEFAULT_THICKNESS_CM,
    };
  }
  return null;
}

export function getProductLogistics(product: Product): {
  weightGrams: number;
  dimensions: PackageSize;
} {
  const measures = getProductMeasures(product);
  const fromMeasures = (() => {
    const heightCm = measures.heightCm;
    const widthCm = measures.widthCm ?? measures.diameterCm;
    const lengthCm =
      measures.depthCm ?? measures.diameterCm ?? measures.widthCm;
    if (heightCm && widthCm && lengthCm) {
      return { heightCm, widthCm, lengthCm };
    }
    if (measures.diameterCm) {
      return {
        heightCm: heightCm ?? measures.diameterCm,
        widthCm: measures.diameterCm,
        lengthCm: measures.diameterCm,
      };
    }
    return null;
  })();

  const fromProduct =
    fromMeasures ??
    (product.dimensions &&
    toNumber(product.dimensions.heightCm) &&
    toNumber(product.dimensions.widthCm) &&
    toNumber(product.dimensions.lengthCm)
      ? {
          heightCm: product.dimensions.heightCm,
          widthCm: product.dimensions.widthCm,
          lengthCm: product.dimensions.lengthCm,
        }
      : parseDimensionString(product.specifications.dimensions));

  return {
    weightGrams: toNumber(product.weightGrams) ?? DEFAULT_WEIGHT_GRAMS,
    dimensions: fromProduct ?? {
      lengthCm: 20,
      widthCm: 20,
      heightCm: DEFAULT_THICKNESS_CM,
    },
  };
}

export function packageVolumeCm3(size: PackageSize) {
  return size.heightCm * size.widthCm * size.lengthCm;
}

export function exceedsStandardMail(
  size: PackageSize | null | undefined,
  weightGrams: number,
) {
  const sides = [
    size?.heightCm ?? 0,
    size?.widthCm ?? 0,
    size?.lengthCm ?? 0,
  ];
  return (
    sides.some((side) => side > STANDARD_MAX_SIDE_CM) ||
    weightGrams > STANDARD_MAX_WEIGHT_GRAMS
  );
}
